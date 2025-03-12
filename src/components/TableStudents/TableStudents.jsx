import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@progress/kendo-react-dialogs";
import { orderBy } from "@progress/kendo-data-query";

// Import data service
import {
  getAllStudents,
  deleteStudent,
  getStudentsWithSubjects,
} from "../../services/dataService";

const TableStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentsWithSubjects, setStudentsWithSubjects] = useState([]);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sort, setSort] = useState([{ field: "id", dir: "asc" }]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectionEnabled, setSelectionEnabled] = useState(false);
  const navigate = useNavigate();

  const filterTypes = [
    { text: "All Students", value: "all" },
    { text: "Has Subjects", value: "hasSubjects" },
    { text: "No Subjects", value: "noSubjects" },
  ];

  useEffect(() => {
    // Load students data from service
    refreshStudentData();
  }, []);

  // Apply filters whenever search text or filter type changes
  useEffect(() => {
    applyFilters();
  }, [searchText, filterType, students, sort]);

  const refreshStudentData = () => {
    const allStudents = getAllStudents();
    const withSubjects = getStudentsWithSubjects();
    setStudents(allStudents);
    setStudentsWithSubjects(withSubjects);
    // Initial filtering will be applied by the useEffect that watches students
  };

  const applyFilters = () => {
    let result = [...students];

    // Apply text search filter
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(
        (student) =>
          student.firstName.toLowerCase().includes(lowerSearchText) ||
          student.lastName.toLowerCase().includes(lowerSearchText) ||
          student.email.toLowerCase().includes(lowerSearchText)
      );
    }

    // Apply dropdown filter
    if (filterType !== "all") {
      const studentsWithSubjectsMap = studentsWithSubjects.reduce(
        (map, student) => {
          map[student.id] = student.subjects.length > 0;
          return map;
        },
        {}
      );

      result = result.filter((student) => {
        const hasSubjects = studentsWithSubjectsMap[student.id] || false;
        return filterType === "hasSubjects" ? hasSubjects : !hasSubjects;
      });
    }

    // Apply sorting
    if (sort.length > 0) {
      result = orderBy(result, sort);
    }

    setFilteredStudents(result);
  };

  const handleAddNewClick = () => {
    navigate("/add-student");
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      refreshStudentData();
    }
    setShowConfirmDialog(false);
    setStudentToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setStudentToDelete(null);
  };

  const handleViewSubjects = (student) => {
    // We could navigate to a detail page here or show a dialog
    const studentWithSubjects = studentsWithSubjects.find(
      (s) => s.id === student.id
    );
    if (
      studentWithSubjects &&
      studentWithSubjects.subjects &&
      studentWithSubjects.subjects.length > 0
    ) {
      alert(
        `${student.firstName} ${student.lastName} is enrolled in: \n` +
          studentWithSubjects.subjects
            .map((s) => `- ${s.subjectName} (${s.subjectCode})`)
            .join("\n")
      );
    } else {
      alert(
        `${student.firstName} ${student.lastName} is not enrolled in any subjects.`
      );
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.value);
  };

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const toggleSelection = () => {
    setSelectionEnabled(!selectionEnabled);
    // Clear selections when toggling off
    if (selectionEnabled) {
      setSelectedStudents([]);
    }
  };

  const handleSelectionChange = (event) => {
    const { dataItem, syntheticEvent } = event;
    const isSelected = syntheticEvent.target.checked;

    setSelectedStudents((prevSelected) => {
      if (isSelected) {
        return [...prevSelected, dataItem.id];
      } else {
        return prevSelected.filter((id) => id !== dataItem.id);
      }
    });
  };

  const handleSelectAll = (event) => {
    const isSelected = event.target.checked;
    if (isSelected) {
      setSelectedStudents(filteredStudents.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedStudents.length} selected students?`
      )
    ) {
      try {
        // Sequential deletion to ensure all operations complete
        for (const studentId of selectedStudents) {
          await deleteStudent(studentId);
        }
        refreshStudentData();
        setSelectedStudents([]);
      } catch (error) {
        console.error("Error during bulk deletion:", error);
      }
    }
  };

  const rowRender = (trElement, props) => {
    const isEven = props.dataIndex % 2 === 0;
    const trProps = {
      ...trElement.props,
      className: `${trElement.props.className} ${
        isEven ? "even-row" : "odd-row"
      }`,
    };
    return React.cloneElement(
      trElement,
      { ...trProps },
      trElement.props.children
    );
  };

  // Custom cell for rendering the checkbox - Moved inside component
  const SelectionCell = (props) => {
    const { dataItem } = props;
    const isSelected = selectedStudents.includes(dataItem.id);

    return (
      <td className="selection-cell">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {
            setSelectedStudents((prev) => {
              if (isSelected) {
                return prev.filter((id) => id !== dataItem.id);
              } else {
                return [...prev, dataItem.id];
              }
            });
          }}
        />
      </td>
    );
  };

  // Custom cell for rendering the header checkbox - Moved inside component
  const SelectionHeaderCell = () => {
    const allSelected =
      filteredStudents.length > 0 &&
      selectedStudents.length === filteredStudents.length;

    return (
      <th className="selection-header">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
        />
      </th>
    );
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Student List</h2>
        <div className="header-buttons">
          <Button
            className={`selection-toggle ${selectionEnabled ? "active" : ""}`}
            onClick={toggleSelection}
          >
            {selectionEnabled ? "Cancel Selection" : "Select Students"}
          </Button>
          {selectionEnabled && selectedStudents.length > 0 && (
            <Button className="bulk-delete-button" onClick={handleBulkDelete}>
              Delete Selected ({selectedStudents.length})
            </Button>
          )}
          <Button
            primary={true}
            onClick={handleAddNewClick}
            className="add-button"
          >
            Add New Student
          </Button>
        </div>
      </div>

      <div className="table-filters">
        <div className="filter-item search-filter">
          <label>Search:</label>
          <Input
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
            className="search-input"
          />
        </div>
      </div>

      <Grid
        data={filteredStudents}
        style={{
          height: "400px",
        }}
        rowRender={rowRender}
        className="student-grid"
        sortable={true}
        sort={sort}
        onSortChange={handleSortChange}
        reorderable={true}
        resizable={true}
      >
        {selectionEnabled && (
          <GridColumn
            field="selection"
            title=" "
            width="50px"
            cell={SelectionCell}
            headerCell={SelectionHeaderCell}
          />
        )}
        <GridColumn field="id" title="ID" width="70px" className="id-column" />
        <GridColumn
          field="firstName"
          title="First Name"
          className="name-column"
        />
        <GridColumn
          field="lastName"
          title="Last Name"
          className="name-column"
        />
        <GridColumn field="email" title="Email" className="email-column" />
        <GridColumn
          title="Actions"
          className="action-column"
          sortable={false}
          cell={(props) => (
            <td>
              <Button
                look="flat"
                className="action-button view-button"
                onClick={() => handleViewSubjects(props.dataItem)}
              >
                Subjects
              </Button>
              <Button
                look="flat"
                className="action-button delete-button"
                onClick={() => handleDeleteClick(props.dataItem)}
              >
                Delete
              </Button>
            </td>
          )}
        />
      </Grid>

      <div className="table-footer">
        <p>
          Total Students: {filteredStudents.length} (Filtered from{" "}
          {students.length})
          {selectedStudents.length > 0 &&
            ` | Selected: ${selectedStudents.length}`}
        </p>
      </div>

      {showConfirmDialog && (
        <Dialog title="Confirm Delete" onClose={handleCancelDelete}>
          <p>
            Are you sure you want to delete{" "}
            <strong>
              {studentToDelete?.firstName} {studentToDelete?.lastName}
            </strong>
            ? This will also remove all their subject subscriptions.
          </p>
          <div className="dialog-buttons">
            <Button onClick={handleCancelDelete}>Cancel</Button>
            <Button look="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default TableStudents;
