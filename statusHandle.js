const statusHandle = (res, status, headers, data, message) => {
  if (status === 200) {
    res.writeHead(status, headers);
    res.write(
      JSON.stringify({
        status,
        data,
      })
    );
    res.end();
  } else {
    res.writeHead(status, headers);
    res.write(
      JSON.stringify({
        status,
        message,
      })
    );
    res.end();
  }
};

module.exports = statusHandle;
