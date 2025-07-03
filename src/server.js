import express from 'express';
const app = express();
const hostname = 'localhost';
const port = 8181;
app.get('/', (req, res) => {
  res.send('<h1>Cat2004</h1>')
})

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});