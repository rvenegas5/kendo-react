// Import JSON data
import students from "../data/students.json";
import subjects from "../data/subjects.json";
import subscriptions from "../data/subscriptions.json";

// Initialize local data store
let studentsData = [...students];
let subjectsData = [...subjects];
let subscriptionsData = [...subscriptions];

// Student functions
export const getAllStudents = () => {
  return [...studentsData];
};

export const getStudentById = (id) => {
  return studentsData.find((student) => student.id === id);
};

export const addStudent = (student) => {
  // Generate a new ID
  const newId =
    studentsData.length > 0
      ? Math.max(...studentsData.map((s) => s.id)) + 1
      : 1;

  const newStudent = {
    id: newId,
    ...student,
  };

  studentsData.push(newStudent);
  return newStudent;
};

export const updateStudent = (id, updatedData) => {
  const index = studentsData.findIndex((student) => student.id === id);
  if (index !== -1) {
    studentsData[index] = { ...studentsData[index], ...updatedData };
    return studentsData[index];
  }
  return null;
};

export const deleteStudent = (id) => {
  const index = studentsData.findIndex((student) => student.id === id);
  if (index !== -1) {
    const deletedStudent = studentsData[index];
    studentsData = studentsData.filter((student) => student.id !== id);

    // Also delete any subscriptions this student had
    subscriptionsData = subscriptionsData.filter((sub) => sub.studentId !== id);

    return deletedStudent;
  }
  return null;
};

// Subject functions
export const getAllSubjects = () => {
  return [...subjectsData];
};

export const getSubjectById = (id) => {
  return subjectsData.find((subject) => subject.id === id);
};

export const addSubject = (subject) => {
  // Generate a new ID
  const newId =
    subjectsData.length > 0
      ? Math.max(...subjectsData.map((s) => s.id)) + 1
      : 1;

  const newSubject = {
    id: newId,
    ...subject,
  };

  subjectsData.push(newSubject);
  return newSubject;
};

export const updateSubject = (id, updatedData) => {
  const index = subjectsData.findIndex((subject) => subject.id === id);
  if (index !== -1) {
    subjectsData[index] = { ...subjectsData[index], ...updatedData };
    return subjectsData[index];
  }
  return null;
};

export const deleteSubject = (id) => {
  const index = subjectsData.findIndex((subject) => subject.id === id);
  if (index !== -1) {
    const deletedSubject = subjectsData[index];
    subjectsData = subjectsData.filter((subject) => subject.id !== id);

    // Also delete any subscriptions to this subject
    subscriptionsData = subscriptionsData.filter((sub) => sub.subjectId !== id);

    return deletedSubject;
  }
  return null;
};

// Subscription functions
export const getAllSubscriptions = () => {
  return [...subscriptionsData];
};

export const getSubscriptionsForStudent = (studentId) => {
  try {
    // Convert studentId to number if it's a string
    const numericStudentId =
      typeof studentId === "string" ? parseInt(studentId, 10) : studentId;

    // Get all subscriptions for this student
    const studentSubscriptions = subscriptionsData.filter(
      (sub) => sub.studentId === numericStudentId
    );

    // Add subject details to each subscription
    return studentSubscriptions.map((sub) => {
      const subject = getSubjectById(sub.subjectId);
      if (!subject) {
        console.error(`Subject with ID ${sub.subjectId} not found`);
        return { ...sub, subject: null };
      }
      return {
        ...sub,
        subject,
      };
    });
  } catch (error) {
    console.error("Error in getSubscriptionsForStudent:", error);
    return [];
  }
};

export const getStudentsForSubject = (subjectId) => {
  try {
    // Convert subjectId to number if it's a string
    const numericSubjectId =
      typeof subjectId === "string" ? parseInt(subjectId, 10) : subjectId;

    // Get all subscriptions for this subject
    const subjectSubscriptions = subscriptionsData.filter(
      (sub) => sub.subjectId === numericSubjectId
    );

    // Add student details to each subscription
    return subjectSubscriptions.map((sub) => {
      const student = getStudentById(sub.studentId);
      if (!student) {
        console.error(`Student with ID ${sub.studentId} not found`);
        return { ...sub, student: null };
      }
      return {
        ...sub,
        student,
      };
    });
  } catch (error) {
    console.error("Error in getStudentsForSubject:", error);
    return [];
  }
};

export const subscribeStudentToSubject = (studentId, subjectId) => {
  try {
    // Convert IDs to numbers if they're strings
    const numericStudentId =
      typeof studentId === "string" ? parseInt(studentId, 10) : studentId;
    const numericSubjectId =
      typeof subjectId === "string" ? parseInt(subjectId, 10) : subjectId;

    // Check if student and subject exist
    const student = getStudentById(numericStudentId);
    const subject = getSubjectById(numericSubjectId);

    if (!student) {
      console.error(`Student with ID ${numericStudentId} not found`);
      return null;
    }

    if (!subject) {
      console.error(`Subject with ID ${numericSubjectId} not found`);
      return null;
    }

    // Check if subscription already exists
    const existingSubscription = subscriptionsData.find(
      (sub) =>
        sub.studentId === numericStudentId && sub.subjectId === numericSubjectId
    );

    if (existingSubscription) {
      console.log("Subscription already exists:", existingSubscription);
      return existingSubscription;
    }

    // Generate a new ID
    const newId =
      subscriptionsData.length > 0
        ? Math.max(...subscriptionsData.map((s) => s.id)) + 1
        : 1;

    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    const newSubscription = {
      id: newId,
      studentId: numericStudentId,
      subjectId: numericSubjectId,
      enrollmentDate: today,
    };

    console.log("Creating new subscription:", newSubscription);
    subscriptionsData.push(newSubscription);

    // Return the subscription with subject data
    return {
      ...newSubscription,
      subject: subject,
    };
  } catch (error) {
    console.error("Error in subscribeStudentToSubject:", error);
    return null;
  }
};

export const unsubscribeStudentFromSubject = (studentId, subjectId) => {
  try {
    // Convert IDs to numbers if they're strings
    const numericStudentId =
      typeof studentId === "string" ? parseInt(studentId, 10) : studentId;
    const numericSubjectId =
      typeof subjectId === "string" ? parseInt(subjectId, 10) : subjectId;

    // Find the subscription
    const index = subscriptionsData.findIndex(
      (sub) =>
        sub.studentId === numericStudentId && sub.subjectId === numericSubjectId
    );

    if (index === -1) {
      console.error(
        `Subscription not found for student ${numericStudentId} and subject ${numericSubjectId}`
      );
      return null;
    }

    const deletedSubscription = subscriptionsData[index];
    console.log("Deleting subscription:", deletedSubscription);

    // Remove the subscription
    subscriptionsData = subscriptionsData.filter(
      (sub) => sub.id !== deletedSubscription.id
    );

    return deletedSubscription;
  } catch (error) {
    console.error("Error in unsubscribeStudentFromSubject:", error);
    return null;
  }
};

// Helper function to get detailed data with relationships
export const getStudentsWithSubjects = () => {
  try {
    return studentsData.map((student) => {
      const studentSubjects = getSubscriptionsForStudent(student.id);
      return {
        ...student,
        subjects: studentSubjects.map((sub) => sub.subject).filter(Boolean),
      };
    });
  } catch (error) {
    console.error("Error in getStudentsWithSubjects:", error);
    return [];
  }
};

export const getSubjectsWithStudents = () => {
  try {
    return subjectsData.map((subject) => {
      const subjectStudents = getStudentsForSubject(subject.id);
      return {
        ...subject,
        students: subjectStudents.map((sub) => sub.student).filter(Boolean),
      };
    });
  } catch (error) {
    console.error("Error in getSubjectsWithStudents:", error);
    return [];
  }
};
