import React, { useState } from "react";
import {
  Form,
  Field,
  FormElement,
  FieldWrapper,
} from "@progress/kendo-react-form";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";
import { Fade } from "@progress/kendo-react-animation";
import { useNavigate } from "react-router-dom";

// Import data service
import { addSubject } from "../../services/dataService";

const requiredValidator = (value) => {
  return value ? "" : "This field is required";
};

const numericValidator = (value) => {
  return !value
    ? "Credits are required"
    : isNaN(value)
    ? "Credits must be a number"
    : value <= 0
    ? "Credits must be greater than 0"
    : "";
};

const FormSubject = () => {
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (dataItem) => {
    // Add subject using the data service
    const newSubject = addSubject({
      subjectName: dataItem.subjectName,
      subjectCode: dataItem.subjectCode,
      credits: Number(dataItem.credits),
    });

    if (newSubject) {
      setSuccess(true);
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        // Navigate to subjects table after successful addition
        navigate("/subjects");
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
              <span>Subject added successfully!</span>
            </Notification>
          )}
        </Fade>
      </NotificationGroup>

      <Form
        onSubmit={handleSubmit}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <legend className={"k-form-legend"}>Add New Subject</legend>

              <FieldWrapper>
                <div className="k-form-field-wrap">
                  <Field
                    name={"subjectName"}
                    component={Input}
                    labelClassName={"k-form-label"}
                    label={"Subject Name"}
                    validator={requiredValidator}
                  />
                </div>
              </FieldWrapper>

              <FieldWrapper>
                <div className="k-form-field-wrap">
                  <Field
                    name={"subjectCode"}
                    component={Input}
                    labelClassName={"k-form-label"}
                    label={"Subject Code"}
                    validator={requiredValidator}
                  />
                </div>
              </FieldWrapper>

              <FieldWrapper>
                <div className="k-form-field-wrap">
                  <Field
                    name={"credits"}
                    type={"number"}
                    component={Input}
                    labelClassName={"k-form-label"}
                    label={"Credits"}
                    validator={numericValidator}
                  />
                </div>
              </FieldWrapper>
            </fieldset>
            <div className="k-form-buttons">
              <Button
                primary={true}
                disabled={!formRenderProps.allowSubmit}
                type="submit"
              >
                Add Subject
              </Button>
            </div>
          </FormElement>
        )}
      />
    </div>
  );
};

export default FormSubject;
