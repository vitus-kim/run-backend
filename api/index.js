export default function handler(req, res) {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Run App</title>
        <script>
          window.location.href = '/';
        </script>
      </head>
      <body>
        <p>Redirecting...</p>
      </body>
    </html>
  `);
}
