// views/exampleView.js
exports.renderData = (data) => {
    return `<ul>${data.map(item => `<li>${item.name}</li>`).join('')}</ul>`;
  };
  