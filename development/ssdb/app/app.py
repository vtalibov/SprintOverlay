from flask import Flask, g, jsonify, request 
import json, sqlite3, threading, time, os, logging
from flask_cors import CORS # for local python server to operate without CORS restrictions

# TODO readup on squelalchemy and connection pooling to maintain multiple connections.

app = Flask(__name__)
CORS(app)

logging.basicConfig(filename='logs/ssdb.log', filemode='a', level=logging.ERROR, 
                    format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')

# Change these accordingly
PATH_TO_DATABASE = 'database/my_database.db'
DATABASE_TABLE =  'my_table'

# Global variables for the two in-memory databases
current_db = None # working db
new_db = None # freshly loaded/updated db
db_lock = threading.Lock()  # To synchronize access to the databases

# generates connection to a db on a disk
def get_db(path_to_database):
    if os.path.exists(path_to_database):
        return sqlite3.connect(path_to_database)
    else:
        error_message = f"Database not found at {path_to_database}"
        app.logger.error(error_message)
        return None

# loads db from file and stores it and its connection in memory
def load_db_to_memory(path_to_database):
    global new_db
    source_db =  get_db(path_to_database)
    if source_db is not None:
        memory_db = sqlite3.connect(":memory:", check_same_thread=False) # dummy db in memory
        source_db.backup(memory_db)  # Copy data from disk to memory
        new_db = memory_db
    else:
        error_message = f"Failed to open the database"
        app.logger.error(error_message)
    source_db.close()

# Swaps current working database with the new database, loaded to memory
def swap_databases():
    global current_db, new_db
    # to ensure no operations happen during the swap
    with db_lock:
        current_db, new_db = new_db, current_db
        # discard old database after the swap
        if new_db:
            new_db.close()

# load the database, do the swap and wait for (interval) seconds
def reload_db(path_do_database, interval):
    while True:
        try:    
            load_db_to_memory(path_do_database)
            swap_databases()
        except Exception as e:
            print(e)
        time.sleep(interval)

# Start the periodic load/swap in a background thread
def start_periodic_reload(path_do_database, interval):
    reload_thread = threading.Thread(target=reload_db, args=(path_do_database, interval), daemon=True)
    reload_thread.start()

# General function to query database. 
# Results are returned via sqlite3.Row as 'dictionary' rows. Simplifies
# conversion to JSON later.
# NB! There is a single connection and it is not closed after the requests.
def query_db(query, args=(), one=False):
    current_db.row_factory = sqlite3.Row
    # execute() automatically generates cursor
    cur = current_db.execute(query, args)
    if one:
        result_set = cur.fetchone()
    else:
        result_set = cur.fetchall()
    cur.close()
    return result_set

# result_set to list of dictionaries, i.e. JSON output
def to_json_output(data):
    return [dict(ix) for ix in data]

@app.route('/get_projects')
def get_projects():
    projects = query_db(f"SELECT DISTINCT project FROM {DATABASE_TABLE}")
    projects = to_json_output(projects)
    print(projects)
    # Return the projects as JSON
    return jsonify(projects)

@app.route('/get_project_series', methods=['POST'])
def get_project_series():
    selected_project = request.json['Project']
    data = query_db(f"SELECT DISTINCT series, project FROM {DATABASE_TABLE} WHERE Project = ?", (selected_project,))
    # jsonification, tuples are into list of dictionaries
    result = to_json_output(data)
    return jsonify(result)

@app.route('/get_project_structures_in_series', methods=['POST'])
def get_project_structures_in_series():
    data = request.json
    selected_project = data.get('Project')
    selected_series = data.get('Series')
    data = query_db(f"SELECT Project, ligand, PathToProtein, PathToLigand, pIC50 FROM {DATABASE_TABLE} WHERE Project = ? AND Series = ?", (selected_project, selected_series,))
    # jsonification, tuples are into list of dictionaries
    result = to_json_output(data)
    return jsonify(result)

@app.route('/get_ligand_sformula', methods=['POST'])
def get_ligand_sformula():
    data = request.json
    selected_project = data.get('Project')
    selected_ligand = data.get('Ligand')
    data = query_db(f"SELECT ligand, SMILES FROM {DATABASE_TABLE} WHERE Project = ? AND Ligand = ?", (selected_project, selected_ligand,))
    # jsonification, tuples are into list of dictionaries
    result = to_json_output(data)
    return jsonify(result)

start_periodic_reload(PATH_TO_DATABASE, 60)

if __name__ == '__main__':
    app.run(debug=False, port=5000)
