from flask import Flask, send_from_directory

app = Flask(__name__)


@app.route("/")
def index():
    return send_from_directory("./templates", "index.html")


@app.route("/template.docx")
def get_template():
    """Отдаем шаблон файла для загрузки в браузер"""
    return send_from_directory("./grant_templates", "template.docx")


@app.route("/grant_type_r1_template.docx")
def get_r1_template():
    return send_from_directory("./grant_templates", "grant_type_r1_template.docx")


@app.route("/grant_type_d1_template.docx")
def get_d1_template():
    return send_from_directory("./grant_templates", "grant_type_d1_template.docx")


@app.route("/grant_type_d2_template.docx")
def get_d2_template():
    return send_from_directory("./grant_templates", "grant_type_d2_template.docx")


@app.route("/application_template_d.docx")
def get_application_template_for_d_grant_type():
    return send_from_directory("./grant_templates", "application_template_d.docx")


@app.route("/application_template_r.docx")
def get_application_template_for_r_grant_type():
    return send_from_directory("./grant_templates", "application_template_r.docx")


if __name__ == "__main__":
    app.run(debug=True)
