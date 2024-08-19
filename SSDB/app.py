from flask import Flask, render_template, request, redirect, url_for, jsonify, g
import json, sqlite3
from flask_cors import CORS # for local python server to operate without CORS restrictions

app = Flask(__name__)
CORS(app)

#path to database
PATH_TO_DATABASE = 'database/my_database.db'

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
    projects = query_db("SELECT DISTINCT project FROM my_table")
    projects = to_json_output(projects)
    print(projects)
    # Return the projects as JSON
    return jsonify(projects)

@app.route('/add_entry', methods=['POST'])
def add_entry():
    project = request.form['project']
    protein = request.form['protein']
    XtalSystem = request.form['XtalSystem']
    Series = request.form['Series']
    Ligand = request.form['Ligand']
    comment = request.form['comment']
    path_to_structure = request.form['path_to_structure']
    transact_db("INSERT INTO my_table (Project, Protein, XtalSystem, Series, Ligand, Comment, PathToStructure) VALUES (?, ?, ?, ?, ?, ?, ?)", (project, protein, XtalSystem, Series, Ligand, comment, path_to_structure))
    return redirect(url_for('index'))

@app.route('/get_project_series', methods=['POST'])
def get_project_series():
    # AJAX request is an object with a single key-value pair: { 'project': selectedProject }
    selected_project = request.json['Project']
    data = query_db("SELECT DISTINCT series, project FROM my_table WHERE Project = ?", (selected_project,))
    # jsonification, tuples are into list of dictionaries
    result = to_json_output(data)
    return jsonify(result)

@app.route('/get_project_structures_in_series', methods=['POST'])
def get_project_structures_in_series():
    # AJAX request is an object with a single key-value pair: { 'project': selectedProject }
    data = request.json
    selected_project = data.get('Project')
    selected_series = data.get('Series')
    data = query_db("SELECT Project, ligand, PathToStructure, PathToLigand FROM my_table WHERE Project = ? AND Series = ?", (selected_project, selected_series,))
    # jsonification, tuples are into list of dictionaries
    result = to_json_output(data)
    return jsonify(result)

@app.route('/get_ligand_sformula', methods=['POST'])
def get_ligand_sformula():
    # AJAX request is an object with a single key-value pair: { 'project': selectedProject }
    data = request.json
    selected_project = data.get('Project')
    selected_ligand = data.get('Ligand')
    data = query_db("SELECT ligand, SMILES FROM my_table WHERE Project = ? AND Ligand = ?", (selected_project, selected_ligand,))
    # jsonification, tuples are into list of dictionaries
    result = to_json_output(data)
    return jsonify(result)

@app.route('/get_project_data', methods=['POST'])
def get_project_data():
    # AJAX request is an object with a single key-value pair: { 'project': selectedProject }
    selected_project = request.json['project']
    data = query_db("SELECT * FROM my_table WHERE Project = ?", (selected_project,))
    # jsonification, tuples are into list of dictionaries
    result = to_json_output(data)
    return jsonify(result)

@app.route('/export_json')
def export_json():
    data = query_db('SELECT * FROM my_table')
    result = to_json_output(data)
    with open('output.json', 'w') as json_file:
        json.dump(result, json_file, indent=4)
    return jsonify({'message': 'JSON file exported successfully'})

@app.route('/delete_entry', methods=['POST'])
def delete_entry():
    entry_id = request.form['entry_id']
    transact_db("DELETE FROM my_table WHERE ID=?", (entry_id,))
    return redirect(url_for('index'))

# TODO work on edit and update functions! Refactor with general DB functions
@app.route('/edit_entry/<int:entry_id>', methods=['GET'])
def edit_entry(entry_id):
    entry = query_db("SELECT * FROM my_table WHERE ID=?", (entry_id,), one = True)
    return render_template('edit.html', entry=entry)

@app.route('/update_entry/<int:entry_id>', methods=['POST'])
def update_entry(entry_id):
    project = request.form['project']
    protein = request.form['protein']
    XtalSystem = request.form['XtalSystem']
    Series = request.form['Series']
    Ligand = request.form['Ligand']
    comment = request.form['comment']
    path_to_structure = request.form['path_to_structure']
    transact_db("UPDATE my_table SET Project=?, Protein=?, XtalSystem=?, Series=?, Ligand=?, Comment=?, PathToStructure=? WHERE ID=?", (project, protein, XtalSystem, Series, Ligand, comment, path_to_structure, entry_id))
    return redirect(url_for('index'))

@app.route('/')
def index():
    entries = query_db("SELECT * FROM my_table")
    return render_template('index.html', entries=entries)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
