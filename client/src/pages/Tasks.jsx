import { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Button, Spinner, Alert, Modal
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppNavbar from '../components/AppNavbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskFilters from '../components/TaskFilters';
import api from '../api/axios';

const Tasks = () => {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [searchParams]            = useSearchParams();

  const [filters, setFilters] = useState({
    search:   '',
    status:   '',
    priority: '',
  });

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search)   params.search   = filters.search;

      const res = await api.get('/tasks', { params });

      // Client-side search filter (for instant search UX)
      let result = res.data.tasks;
      setTasks(result);
    } catch (err) {
      setError('Failed to load tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Open create modal if ?create=true in URL
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowModal(true);
    }
  }, [searchParams]);

  // Create or update task
  const handleSubmit = async (data) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, data);
        toast.success('Task updated! ✏️');
      } else {
        await api.post('/tasks', data);
        toast.success('Task created! 🎉');
      }
      setShowModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
      throw err; // Keep modal open on error
    }
  };

  // Edit
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteId}`);
      toast.success('Task deleted.');
      setDeleteId(null);
      fetchTasks();
    } catch {
      toast.error('Failed to delete task.');
    } finally {
      setDeleting(false);
    }
  };

  // Status quick-change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated!');
      fetchTasks();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  return (
    <>
      <AppNavbar />
      <Container className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0">My Tasks</h2>
            <p className="text-muted mb-0">
              {loading ? '...' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            ➕ New Task
          </Button>
        </div>

        {/* Filters */}
        <TaskFilters filters={filters} onFilterChange={setFilters} />

        {/* Content */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading tasks...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : tasks.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>📭</div>
            <h5 className="text-muted mt-3">No tasks found</h5>
            <p className="text-muted">
              {filters.search || filters.status || filters.priority
                ? 'Try adjusting your filters.'
                : "Click '+ New Task' to create your first task!"}
            </p>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {tasks.map((task) => (
              <Col key={task.id}>
                <TaskCard
                  task={task}
                  onEdit={handleEdit}
                  onDelete={setDeleteId}
                  onStatusChange={handleStatusChange}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Create/Edit Modal */}
      <TaskModal
        show={showModal}
        onHide={closeModal}
        onSubmit={handleSubmit}
        task={editingTask}
      />

      {/* Delete Confirm Modal */}
      <Modal show={!!deleteId} onHide={() => setDeleteId(null)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Delete Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this task? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Tasks;
