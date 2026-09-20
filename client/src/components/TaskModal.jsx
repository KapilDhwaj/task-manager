import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const TaskModal = ({ show, onHide, onSubmit, task }) => {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (task) {
      reset({
        title:       task.title       || '',
        description: task.description || '',
        status:      task.status      || 'todo',
        priority:    task.priority    || 'medium',
        due_date:    task.due_date    ? task.due_date.split('T')[0] : '',
      });
    } else {
      reset({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '' });
    }
  }, [task, reset]);

  const handleFormSubmit = async (data) => {
    // Convert empty string to null
    if (!data.due_date) data.due_date = null;
    if (!data.description) data.description = null;
    await onSubmit(data);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{isEditing ? '✏️ Edit Task' : '➕ Create New Task'}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        <Modal.Body className="p-4">
          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Title *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter task title..."
              isInvalid={!!errors.title}
              {...register('title', { required: 'Title is required', maxLength: { value: 255, message: 'Max 255 characters' } })}
            />
            <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Optional description..."
              {...register('description')}
            />
          </Form.Group>

          <Row className="g-3">
            {/* Status */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Status</Form.Label>
                <Form.Select {...register('status')}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Priority */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Priority</Form.Label>
                <Form.Select {...register('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Due Date */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Due Date</Form.Label>
                <Form.Control type="date" {...register('due_date')} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskModal;
