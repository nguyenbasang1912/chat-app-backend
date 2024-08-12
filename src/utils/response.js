class SuccessResponse {
  constructor({ message, status, data }) {
    this.message = message;
    this.status = status;
    this.data = data;
  }

  json(res) {
    return res.status(this.status || 200).json({
      message: this.message,
      data: this.data,
    });
  }
}

module.exports = SuccessResponse;
