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
  getAllSubjects,
  deleteSubject,
  getSubjectsWithStudents,
} from "../../services/dataService";

const TableSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [subjectsWithStudents, setSubjectsWithStudents] = useState([]);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sort, setSort] = useState([{ field: "id", dir: "asc" }]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectionEnabled, setSelectionEnabled] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const filterTypes = [
    { text: "All Subjects", value: "all" },
    { text: "Has Students", value: "hasStudents" },
    { text: "No Students", value: "noStudents" },
    { text: "High Credits (≥4)", value: "highCredits" },
    { text: "Low Credits (<4)", value: "lowCredits" },
  ];

  useEffect(() => {
    // Load subjects data from service
    refreshSubjectData();
  }, []);

  // Apply filters whenever search text or filter type changes
  useEffect(() => {
    applyFilters();
  }, [searchText, filterType, subjects, sort]);

  const refreshSubjectData = () => {
    const allSubjects = getAllSubjects();
    const withStudents = getSubjectsWithStudents();
    setSubjects(allSubjects);
    setSubjectsWithStudents(withStudents);
  };

  const applyFilters = () => {
    let result = [...subjects];

    // Apply text search filter
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      result = result.filter(
        (subject) =>
          subject.subjectName.toLowerCase().includes(lowerSearchText) ||
          subject.subjectCode.toLowerCase().includes(lowerSearchText)
      );
    }

    // Apply dropdown filter
    if (filterType !== "all") {
      const subjectsWithStudentsMap = subjectsWithStudents.reduce(
        (map, subject) => {
          map[subject.id] = subject.students.length > 0;
          return map;
        },
        {}
      );

      switch (filterType) {
        case "hasStudents":
          result = result.filter(
            (subject) => subjectsWithStudentsMap[subject.id] || false
          );
          break;
        case "noStudents":
          result = result.filter(
            (subject) => !(subjectsWithStudentsMap[subject.id] || false)
          );
          break;
        case "highCredits":
          result = result.filter((subject) => subject.credits >= 4);
          break;
        case "lowCredits":
          result = result.filter((subject) => subject.credits < 4);
          break;
        default:
          break;
      }
    }

    // Apply sorting
    if (sort.length > 0) {
      result = orderBy(result, sort);
    }

    setFilteredSubjects(result);
  };

  const handleAddNewClick = () => {
    navigate("/subjects/add");
  };

  const handleDeleteClick = (subject) => {
    setSubjectToDelete(subject);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (subjectToDelete) {
      deleteSubject(subjectToDelete.id);
      refreshSubjectData();
    }
    setShowConfirmDialog(false);
    setSubjectToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setSubjectToDelete(null);
  };

  const handleViewStudents = (subject) => {
    const subjectWithStudents = subjectsWithStudents.find(
      (s) => s.id === subject.id
    );
    if (
      subjectWithStudents &&
      subjectWithStudents.students &&
      subjectWithStudents.students.length > 0
    ) {
      alert(
        `${subject.subjectName} (${subject.subjectCode}) has the following students enrolled: \n` +
          subjectWithStudents.students
            .map((s) => `- ${s.firstName} ${s.lastName}`)
            .join("\n")
      );
    } else {
      alert(
        `${subject.subjectName} (${subject.subjectCode}) has no students enrolled.`
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
      setSelectedSubjects([]);
    }
  };

  const handleSelectAll = (event) => {
    const isSelected = event.target.checked;
    if (isSelected) {
      setSelectedSubjects(filteredSubjects.map((subject) => subject.id));
    } else {
      setSelectedSubjects([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject to delete");
      return;
    }
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async () => {
    try {
      // Sequential deletion
      for (const subjectId of selectedSubjects) {
        deleteSubject(subjectId);
      }
      refreshSubjectData();
      setSelectedSubjects([]);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error("Error during bulk deletion:", error);
    }
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteDialog(false);
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

  // Custom cell for rendering checkboxes
  const SelectionCell = (props) => {
    const { dataItem } = props;
    const isSelected = selectedSubjects.includes(dataItem.id);

    return (
      <td className="selection-cell">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {
            setSelectedSubjects((prev) => {
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

  // Custom cell for header checkbox
  const SelectionHeaderCell = () => {
    const allSelected =
      filteredSubjects.length > 0 &&
      selectedSubjects.length === filteredSubjects.length;

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
        <h2>Subject List</h2>
        <div className="header-buttons">
          <Button
            className={`selection-toggle ${selectionEnabled ? "active" : ""}`}
            onClick={toggleSelection}
          >
            {selectionEnabled ? "Cancel Selection" : "Select Subjects"}
          </Button>
          {selectionEnabled && selectedSubjects.length > 0 && (
            <Button className="bulk-delete-button" onClick={handleBulkDelete}>
              Delete Selected ({selectedSubjects.length})
            </Button>
          )}
          <Button
            primary={true}
            onClick={handleAddNewClick}
            className="add-button"
          >
            Add New Subject
          </Button>
        </div>
      </div>

      <div className="table-filters">
        <div className="filter-item search-filter">
          <label>Search:</label>
          <Input
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search by name or code..."
            className="search-input"
          />
        </div>
      </div>

      <Grid
        data={filteredSubjects}
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
          field="subjectName"
          title="Subject Name"
          className="name-column"
        />
        <GridColumn
          field="subjectCode"
          title="Subject Code"
          className="code-column"
        />
        <GridColumn
          field="credits"
          title="Credits"
          width="100px"
          className="credits-column"
        />
        <GridColumn
          title="Actions"
          className="action-column"
          sortable={false}
          cell={(props) => (
            <td>
              <Button
                look="flat"
                className="action-button view-button"
                onClick={() => handleViewStudents(props.dataItem)}
              >
                Students
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
          Total Subjects: {subjects.length} | Filtered:{" "}
          {filteredSubjects.length}
          {selectedSubjects.length > 0 &&
            ` | Selected: ${selectedSubjects.length}`}
        </p>
      </div>

      {showConfirmDialog && (
        <Dialog title="Confirm Delete" onClose={handleCancelDelete}>
          <p>
            Are you sure you want to delete{" "}
            <strong>
              {subjectToDelete?.subjectName} ({subjectToDelete?.subjectCode})
            </strong>
            ? This will also remove all student subscriptions to this subject.
          </p>
          <div className="dialog-buttons">
            <Button onClick={handleCancelDelete}>Cancel</Button>
            <Button look="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </Dialog>
      )}

      {showBulkDeleteDialog && (
        <Dialog title="Confirm Bulk Delete" onClose={cancelBulkDelete}>
          <p>
            Are you sure you want to delete{" "}
            <strong>{selectedSubjects.length} selected subjects</strong>? This
            will also remove all student subscriptions to these subjects.
          </p>
          <div className="dialog-buttons">
            <Button onClick={cancelBulkDelete}>Cancel</Button>
            <Button look="danger" onClick={confirmBulkDelete}>
              Delete All Selected
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default TableSubjects;
