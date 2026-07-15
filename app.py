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


if __name__ == "__main__":
    app.run(debug=True)
