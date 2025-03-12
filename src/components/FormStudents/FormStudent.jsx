import React, { useState } from "react";
import {
  Form,
  Field,
  FormElement,
  FieldWrapper,
} from "@progress/kendo-react-form";
import { Error } from "@progress/kendo-react-labels";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";
import { Fade } from "@progress/kendo-react-animation";
import { useNavigate } from "react-router-dom";

// Import data service
import { addStudent } from "../../services/dataService";

const emailRegex = new RegExp(/\S+@\S+\.\S+/);
const emailValidator = (value) =>
  emailRegex.test(value) ? "" : "Please enter a valid email.";

const requiredValidator = (value) => {
  return value ? "" : "This field is required";
};

const EmailInput = (fieldRenderProps) => {
  const { validationMessage, visited, ...others } = fieldRenderProps;
  return (
    <div className="k-form-field-wrap">
      <Input {...others} labelClassName={"k-form-label"} />
      {visited && validationMessage && <Error>{validationMessage}</Error>}
    </div>
  );
};

const FormStudent = () => {
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (dataItem) => {
    // Add student using the data service
    const newStudent = addStudent({
      firstName: dataItem.firstName,
      lastName: dataItem.lastName,
      email: dataItem.email,
    });

    if (newStudent) {
      setSuccess(true);
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        // Navigate to students table after successful addition
        navigate("/students");
      }, 3000);
    }
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
              <span>Student added successfully!</span>
            </Notification>
          )}
        </Fade>
      </NotificationGroup>

      <Form
        onSubmit={handleSubmit}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <legend className={"k-form-legend"}>Add new student</legend>
              <FieldWrapper>
                <div className="k-form-field-wrap">
                  <Field
                    name={"firstName"}
                    component={Input}
                    labelClassName={"k-form-label"}
                    label={"First name"}
                    validator={requiredValidator}
                  />
                </div>
              </FieldWrapper>

              <FieldWrapper>
                <div className="k-form-field-wrap">
                  <Field
                    name={"lastName"}
                    component={Input}
                    labelClassName={"k-form-label"}
                    label={"Last name"}
                    validator={requiredValidator}
                  />
                </div>
              </FieldWrapper>

              <FieldWrapper>
                <Field
                  name={"email"}
                  type={"email"}
                  component={EmailInput}
                  label={"Email"}
                  validator={emailValidator}
                />
              </FieldWrapper>
            </fieldset>
            <div className="k-form-buttons">
              <Button
                primary={true}
                disabled={!formRenderProps.allowSubmit}
                type="submit"
              >
                Add Student
              </Button>
            </div>
          </FormElement>
        )}
      />
    </div>
  );
};

export default FormStudent;
