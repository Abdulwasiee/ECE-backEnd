const studentService = require("../Services/student.service");

const addStudent = async (req, res) => {
  const result = await studentService.addStudent(req.body);
  return res.json(result);
};

const getStudentsByBatch = async (req, res) => {
  let batch_id, stream_id;

  if (req.user.role_id === 5) {
    batch_id = req.user.batch_ids[0];
    stream_id = req.user.stream_id !== null ? req.user.stream_id : null;
  } else {
    batch_id = req.params.batch_id;
    stream_id = req.query.stream_id !== undefined ? req.query.stream_id : null;
  }

  const result = await studentService.getStudentsByBatch(batch_id, stream_id);
  return res.json(result);
};

const deleteStudent = async (req, res) => {
  const { student_id } = req.params;
  const result = await studentService.deleteStudent(student_id);
  return res.json(result);
};

module.exports = {
  addStudent,
  getStudentsByBatch,
  deleteStudent,
};
