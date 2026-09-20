import { useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, ButtonGroup } from 'react-bootstrap';

const TaskFilters = ({ filters, onFilterChange }) => {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-light rounded p-3 mb-4">
      <Row className="g-2 align-items-end">
        {/* Search */}
        <Col md={4}>
          <Form.Label className="small fw-semibold text-muted mb-1">Search</Form.Label>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
            />
            {filters.search && (
              <Button variant="outline-secondary" onClick={() => handleChange('search', '')}>✕</Button>
            )}
          </InputGroup>
        </Col>

        {/* Status Filter */}
        <Col md={3}>
          <Form.Label className="small fw-semibold text-muted mb-1">Status</Form.Label>
          <Form.Select value={filters.status} onChange={(e) => handleChange('status', e.target.value)}>
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </Form.Select>
        </Col>

        {/* Priority Filter */}
        <Col md={3}>
          <Form.Label className="small fw-semibold text-muted mb-1">Priority</Form.Label>
          <Form.Select value={filters.priority} onChange={(e) => handleChange('priority', e.target.value)}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Form.Select>
        </Col>

        {/* Clear Filters */}
        <Col md={2}>
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={() => onFilterChange({ search: '', status: '', priority: '' })}
          >
            Clear All
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default TaskFilters;
