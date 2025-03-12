import React, { useState, useEffect } from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Dialog } from "@progress/kendo-react-dialogs";
import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";
import { Fade } from "@progress/kendo-react-animation";

import {
  getAllStudents,
  getAllSubjects,
  subscribeStudentToSubject,
  unsubscribeStudentFromSubject,
  getSubscriptionsForStudent,
} from "../../services/dataService";

const SubscriptionForm = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studentSubscriptions, setStudentSubscriptions] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const allStudents = getAllStudents();
    const allSubjects = getAllSubjects();

    if (allStudents && allStudents.length > 0) {
      // Enhance students with a fullName property for display
      const enhancedStudents = allStudents.map((student) => ({
        ...student,
        fullName: `${student.firstName} ${student.lastName}`,
      }));
      setStudents(enhancedStudents);
    } else {
      console.error("No students found or error loading students");
    }

    if (allSubjects && allSubjects.length > 0) {
      setSubjects(allSubjects);
    } else {
      console.error("No subjects found or error loading subjects");
    }
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      // Get subscriptions for the selected student
      const subscriptions = getSubscriptionsForStudent(selectedStudent.id);

      // Log for debugging
      console.log("Student ID:", selectedStudent.id);
      console.log("Subscriptions:", subscriptions);

      if (subscriptions) {
        setStudentSubscriptions(subscriptions);
      } else {
        setStudentSubscriptions([]);
      }
    } else {
      setStudentSubscriptions([]);
    }
  }, [selectedStudent]);

  const handleStudentChange = (event) => {
    setSelectedStudent(event?.value);
    setSelectedSubject(null);
  };

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.value);
  };

  const handleSubscribe = () => {
    if (!selectedStudent || !selectedSubject) {
      setErrorMessage("Please select both a student and a subject");
      setShowError(true);
      return;
    }

    // Check if already subscribed
    const alreadySubscribed = studentSubscriptions.some(
      (sub) => sub.subject?.id === selectedSubject.id
    );

    if (alreadySubscribed) {
      setErrorMessage("Student is already subscribed to this subject");
      setShowError(true);
      return;
    }

    try {
      // Use the data service to create the subscription
      const newSubscription = subscribeStudentToSubject(
        selectedStudent.id,
        selectedSubject.id
      );

      if (newSubscription) {
        // Show success message
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

        // Refresh student subscriptions
        const updatedSubscriptions = getSubscriptionsForStudent(
          selectedStudent.id
        );
        setStudentSubscriptions(updatedSubscriptions);

        // Reset selected subject
        setSelectedSubject(null);
      } else {
        setErrorMessage("Failed to subscribe student to subject");
        setShowError(true);
      }
    } catch (error) {
      console.error("Error subscribing student:", error);
      setErrorMessage("An error occurred while subscribing student to subject");
      setShowError(true);
    }
  };

  const handleUnsubscribeClick = (subscription) => {
    setSubscriptionToDelete(subscription);
    setShowConfirmDialog(true);
  };

  const handleConfirmUnsubscribe = () => {
    if (!subscriptionToDelete) return;

    try {
      // Use the data service to unsubscribe
      const result = unsubscribeStudentFromSubject(
        subscriptionToDelete.studentId,
        subscriptionToDelete.subjectId
      );

      if (result) {
        // Show success message
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

        // Refresh the student subscriptions
        const updatedSubscriptions = getSubscriptionsForStudent(
          selectedStudent.id
        );
        setStudentSubscriptions(updatedSubscriptions);
      } else {
        setErrorMessage("Failed to unsubscribe student from subject");
        setShowError(true);
      }
    } catch (error) {
      console.error("Error unsubscribing student:", error);
      setErrorMessage(
        "An error occurred while unsubscribing student from subject"
      );
      setShowError(true);
    }

    // Close dialog and reset
    setShowConfirmDialog(false);
    setSubscriptionToDelete(null);
  };

  const handleCancelUnsubscribe = () => {
    setShowConfirmDialog(false);
    setSubscriptionToDelete(null);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <div className="form-container">
      <NotificationGroup
        style={{ position: "fixed", right: "20px", top: "20px" }}
      >
        <Fade enter={true} exit={true}>
          {success && (
            <Notification
              type={{ style: "success", icon: true }}
              closable={true}
              onClose={() => setSuccess(false)}
            >
              <span>Operation completed successfully!</span>
            </Notification>
          )}
          {showError && (
            <Notification
              type={{ style: "error", icon: true }}
              closable={true}
              onClose={handleCloseError}
            >
              <span>{errorMessage}</span>
            </Notification>
          )}
        </Fade>
      </NotificationGroup>

      <div className="subscription-form">
        <h2>Manage Student Subscriptions</h2>

        <div className="form-row">
          <div className="form-field">
            <label>Select Student</label>
            <DropDownList
              data={students}
              textField="fullName"
              dataItemKey="id"
              value={selectedStudent}
              onChange={handleStudentChange}
              filterable={true}
            />
          </div>
        </div>

        {selectedStudent && (
          <>
            <div className="form-row">
              <div className="form-field">
                <label>Select Subject to Subscribe</label>
                <DropDownList
                  data={subjects}
                  textField="subjectName"
                  dataItemKey="id"
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  filterable={true}
                />
              </div>
            </div>

            <div className="form-buttons">
              <Button
                primary={true}
                disabled={!selectedSubject}
                onClick={handleSubscribe}
              >
                Subscribe to Subject
              </Button>
            </div>

            <h3>Current Subscriptions</h3>
            {studentSubscriptions && studentSubscriptions.length > 0 ? (
              <Grid data={studentSubscriptions}>
                <GridColumn field="subject.subjectName" title="Subject Name" />
                <GridColumn field="subject.subjectCode" title="Subject Code" />
                <GridColumn field="subject.credits" title="Credits" />
                <GridColumn field="enrollmentDate" title="Enrollment Date" />
                <GridColumn
                  title="Actions"
                  cell={(props) => (
                    <td>
                      <Button
                        icon="x"
                        look="flat"
                        onClick={() => handleUnsubscribeClick(props.dataItem)}
                      >
                        Unsubscribe
                      </Button>
                    </td>
                  )}
                />
              </Grid>
            ) : (
              <p>No subscriptions yet</p>
            )}
          </>
        )}

        {showConfirmDialog && (
          <Dialog title="Confirm Unsubscribe" onClose={handleCancelUnsubscribe}>
            <p>
              Are you sure you want to unsubscribe from{" "}
              <strong>{subscriptionToDelete?.subject?.subjectName}</strong>?
            </p>
            <div className="dialog-buttons">
              <Button onClick={handleCancelUnsubscribe}>Cancel</Button>
              <Button primary={true} onClick={handleConfirmUnsubscribe}>
                Confirm Unsubscribe
              </Button>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default SubscriptionForm;
