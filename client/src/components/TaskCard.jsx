import { Badge, Card, Button, Dropdown } from 'react-bootstrap';

const STATUS_COLORS = {
  'todo':        'secondary',
  'in-progress': 'warning',
  'done':        'success',
};

const PRIORITY_COLORS = {
  low:    'info',
  medium: 'primary',
  high:   'danger',
};

const STATUS_LABELS = {
  'todo':        'To Do',
  'in-progress': 'In Progress',
  'done':        'Done',
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();

  return (
    <Card
      className={`h-100 shadow-sm border-0 ${isOverdue ? 'border-danger border' : ''}`}
      style={{ transition: 'transform 0.15s', cursor: 'default' }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <Card.Body className="d-flex flex-column">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex gap-2 flex-wrap">
            <Badge bg={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
            <Badge bg={PRIORITY_COLORS[task.priority]} className="text-capitalize">
              {task.priority}
            </Badge>
          </div>
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="text-muted p-0 border-0" size="sm">
              ⋮
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>Change Status</Dropdown.Header>
              {['todo', 'in-progress', 'done'].map((s) => (
                <Dropdown.Item
                  key={s}
                  onClick={() => onStatusChange(task.id, s)}
                  className={task.status === s ? 'fw-bold' : ''}
                >
                  {STATUS_LABELS[s]}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => onEdit(task)}>✏️ Edit</Dropdown.Item>
              <Dropdown.Item onClick={() => onDelete(task.id)} className="text-danger">
                🗑️ Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Title */}
        <Card.Title className={`fs-6 fw-semibold ${task.status === 'done' ? 'text-decoration-line-through text-muted' : ''}`}>
          {task.title}
        </Card.Title>

        {/* Description */}
        {task.description && (
          <Card.Text className="text-muted small flex-grow-1" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {task.description}
          </Card.Text>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
          {task.due_date ? (
            <small className={`${isOverdue ? 'text-danger fw-bold' : 'text-muted'}`}>
              📅 {isOverdue ? '⚠️ ' : ''}{new Date(task.due_date).toLocaleDateString()}
            </small>
          ) : (
            <small className="text-muted">No due date</small>
          )}
          <div className="d-flex gap-1">
            <Button variant="outline-primary" size="sm" onClick={() => onEdit(task)}>Edit</Button>
            <Button variant="outline-danger" size="sm" onClick={() => onDelete(task.id)}>Delete</Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TaskCard;
