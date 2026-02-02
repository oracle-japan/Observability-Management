const http = require('http');
const fs = require("fs");
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');

// Thick モード
oracledb.initOracleClient({ libDir: '/home/opc/instantclient_23_26' });

console.log(oracledb.thin ? 'Running in thin mode' : 'Running in thick mode');

const PORT = 7000;

async function init() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const server = http.createServer(async (req, res) => {

      /* ===== CRUD ルート ===== */
      if (req.url === "/" && req.method === "GET") return showList(connection, res);
      if (req.url === "/add" && req.method === "GET") return showAddForm(res);
      if (req.url === "/add" && req.method === "POST") return insertRecord(connection, req, res);

      if (req.url.startsWith("/edit") && req.method === "GET") return showEditForm(connection, req, res);
      if (req.url === "/edit" && req.method === "POST") return updateRecord(connection, req, res);

      if (req.url.startsWith("/delete") && req.method === "GET") return deleteRecord(connection, req, res);

      res.writeHead(404);
      res.end("Not Found");
    });

    server.listen(PORT, () => {
      console.log(`Web Banana CRUD app running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("DB connection error:", err);
  }
}



/* ===== 共通 CSS ===== */
const commonCSS = `
  <style>
    body {
      font-family: Arial;
      background-image: url('/banana.jpg');
      background-size: cover;
      background-repeat: no-repeat;
      background-attachment: fixed;
      margin: 0;
      padding: 20px;
      text-align: center;
    }

    h2 {
      font-size: 32px;
      color: #fff;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 2px 2px 5px #000;
    }

    .container {
      background: rgba(255, 255, 255, 0.9);
      padding: 25px;
      width: 75%;
      margin: 0 auto;
      border-radius: 15px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    table {
      margin: 0 auto;
      border-collapse: collapse;
      width: 90%;
      background: rgba(255, 255, 255, 0.95);
    }

    table th, table td {
      padding: 12px;
      border: 1px solid #555;
      font-size: 18px;
    }

    a.add-btn {
      display: inline-block;
      background: #ffcc00;
      padding: 12px 20px;
      font-size: 22px;
      font-weight: bold;
      border-radius: 10px;
      text-decoration: none;
      color: #000;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    }

    a.add-btn:hover {
      background: #ffe066;
    }

    .action-links a {
      margin-right: 10px;
    }

    .form-box {
      background: rgba(255, 255, 255, 0.95);
      padding: 25px;
      width: 60%;
      margin: 0 auto;
      border-radius: 15px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    label {
      font-size: 20px;
      font-weight: bold;
    }

    input, select {
      width: 80%;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid #888;
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 18px;
    }

    button {
      background: #ffcc00;
      border: none;
      padding: 12px 25px;
      font-size: 20px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    }

    button:hover {
      background: #ffe066;
    }
  </style>
`;

/* =======================
   一覧ページ
======================= */
async function showList(conn, res) {
  try {
    const result = await conn.execute(`SELECT * FROM NO_BANANA_FARMER ORDER BY id`);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(commonCSS);

    res.write(`<h2>BANANA FARMER Demonstration</h2>`);
    res.write(`<a class="add-btn" href="/add">Add New Farmer</a><br><br>`);

    res.write("<div class='container'>");
    res.write("<table>");

    // ヘッダ
    res.write("<tr>");
    result.metaData.forEach(col => res.write(`<th>${col.name}</th>`));
    res.write("<th>Actions</th>");
    res.write("</tr>");

    // データ
    result.rows.forEach(row => {
      const id = row[0];
      res.write("<tr>");

      row.forEach(col => res.write(`<td>${col}</td>`));

      res.write(`
        <td class="action-links">
          <a href="/edit?id=${id}">Edit</a>
          <a href="/delete?id=${id}" onclick="return confirm('Delete this farmer?');">
            Delete
          </a>
        </td>
      `);

      res.write("</tr>");
    });

    res.write("</table>");
    res.write("</div>");
    
    // データ・アップロード・エンドポイントとプライベート・キーを設定
    res.write(`
      <script>
      window.apmrum = (window.apmrum || {}); 
      window.apmrum.serviceName='Apm Browser';
      window.apmrum.webApplication='WebApp';
      window.apmrum.ociDataUploadEndpoint='xxxxxxxxxxxxxxxxx'; /* データ・アップロード・エンドポイント */ 
      window.apmrum.OracleAPMPublicDataKey='xxxxxxxxxxxxxxxxx'; /* パブリック・データ・キー */
      </script>
      <!-- APM Browser RUM ライブラリ（データ・アップロード・エンドポイント） -->
      <script async crossorigin="anonymous" src="xxxxxxxxxxxxxxxxx/static/jslib/apmrum.min.js"></script> 
    `);

    res.end();

  } catch (err) {
    handleErr(res, err);
  }
}

/* =======================
    追加フォーム
======================= */
function showAddForm(res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(commonCSS);

  res.write(`<h2>Add New Farmer</h2>`);

  res.write(`
    <div class="form-box">
      <form method="POST" action="/add">
        <label>Farmer Name:</label><br>
        <input type="text" name="farmer" required><br>

        <label>Weight:</label><br>
        <input type="number" name="weight" required><br>

        <label>Ripeness:</label><br>
        <select name="ripeness">
          <option value="All Green">All Green</option>
          <option value="More Yellow than Green">More Yellow than Green</option>
          <option value="Full Yellow">Full Yellow</option>
        </select>
        <br><br>

        <button type="submit">Add Farmer</button>
      </form>
    </div>
  `);
  res.end();
}

/* =======================
    INSERT
======================= */
async function insertRecord(conn, req, res) {
  try {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));

    req.on("end", async () => {
      const params = new URLSearchParams(body);

      const farmer = params.get("farmer");
      const weight = params.get("weight");
      const ripeness = params.get("ripeness");

      await conn.execute(
        `INSERT INTO NO_BANANA_FARMER (farmer, weight, ripeness)
         VALUES (:1, :2, :3)`,
        [farmer, weight, ripeness],
        { autoCommit: true }
      );

      res.writeHead(302, { Location: "/" });
      res.end();
    });

  } catch (err) {
    handleErr(res, err);
  }
}

/* =======================
    編集フォーム
======================= */
async function showEditForm(conn, req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get("id");

  try {
    const result = await conn.execute(
      `SELECT farmer, weight, ripeness
       FROM NO_BANANA_FARMER WHERE id = :id`,
      [id]
    );

    if (result.rows.length === 0) {
      res.writeHead(404);
      res.end("Record not found");
      return;
    }

    const [farmer, weight, ripeness] = result.rows[0];

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(commonCSS);

    res.write(`<h2>Edit Farmer</h2>`);

    res.write(`
      <div class="form-box">
        <form method="POST" action="/edit">
          <input type="hidden" name="id" value="${id}">

          <label>Farmer Name:</label><br>
          <input type="text" name="farmer" value="${farmer}" required><br>

          <label>Weight:</label><br>
          <input type="number" name="weight" value="${weight}" required><br>

          <label>Ripeness:</label><br>
          <select name="ripeness">
            <option ${ripeness === "All Green" ? "selected" : ""}>All Green</option>
            <option ${ripeness === "More Yellow than Green" ? "selected" : ""}>More Yellow than Green</option>
            <option ${ripeness === "Full Yellow" ? "selected" : ""}>Full Yellow</option>
          </select><br><br>

          <button type="submit">Update</button>
        </form>
      </div>
    `);

    res.end();

  } catch (err) {
    handleErr(res, err);
  }
}

/* =======================
    UPDATE
======================= */
async function updateRecord(conn, req, res) {
  try {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));

    req.on("end", async () => {
      const params = new URLSearchParams(body);

      const id = params.get("id");
      const farmer = params.get("farmer");
      const weight = params.get("weight");
      const ripeness = params.get("ripeness");

      await conn.execute(
        `UPDATE NO_BANANA_FARMER
         SET farmer = :1, weight = :2, ripeness = :3
         WHERE id = :4`,
        [farmer, weight, ripeness, id],
        { autoCommit: true }
      );

      res.writeHead(302, { Location: "/" });
      res.end();
    });

  } catch (err) {
    handleErr(res, err);
  }
}

/* =======================
    DELETE
======================= */
async function deleteRecord(conn, req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get("id");

  try {
    await conn.execute(
      `DELETE FROM NO_BANANA_FARMER WHERE id = :id`,
      [id],
      { autoCommit: true }
    );

    res.writeHead(302, { Location: "/" });
    res.end();

  } catch (err) {
    handleErr(res, err);
  }
}

/* =======================
    エラー処理
======================= */
function handleErr(res, err) {
  res.writeHead(500, { "Content-Type": "text/html" });
  res.write(`<h3>Error: ${err.message}</h3>`);
  res.end();
}

init();
