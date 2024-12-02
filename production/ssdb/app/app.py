from flask import Flask, g, jsonify, request 
import json, sqlite3
from flask_cors import CORS # for local python server to operate without CORS restrictions

app = Flask(__name__)
CORS(app)

# Change these accordingly
PATH_TO_DATABASE = 'database/my_database.db'
DATABASE_TABLE =  'my_table'

# to open connection to the database
def get_db():
    db = getattr(g, '_database', None)
    # database connection is stored globally as g, see flask documentation!
    if db is None:
        db = g._database = sqlite3.connect(PATH_TO_DATABASE)
    return db

# General function to query database. 
# Results are returned via sqlite3.Row as 'dictionary' rows. Simplifies
# conversion to JSON later.
def query_db(query, args=(), one=False):
    get_db().row_factory = sqlite3.Row
    # execute() automatically generates cursor
    cur = get_db().execute(query, args)
    if one:
        result_set = cur.fetchone()
    else:
        result_set = cur.fetchall()
    # here explicitly closing cursor is not actually necessary, as
    # close_connection is called after each request.
    cur.close()
    return result_set

# result_set to list of dictionaries, i.e. JSON output
def to_json_output(data):
    return [dict(ix) for ix in data]

def transact_db(query, args=()):
    query_db(query, args)
    get_db().commit()

# close connection; function is called after each request
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

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
    data = query_db(f"SELECT Project, ligand, PathToProtein, PathToLigand FROM {DATABASE_TABLE} WHERE Project = ? AND Series = ?", (selected_project, selected_series,))
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
