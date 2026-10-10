const app = require("./app");

const PORT = 4000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
console.log(
`Simulated External Tool running on port ${PORT}`
);
});
