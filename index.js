import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.static('app'));

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => console.log(`server listening on PORT: ${PORT}`));
