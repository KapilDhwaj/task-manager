import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StatCard = ({ title, value, color, icon }) => (
  <Card className={`border-0 shadow-sm text-white bg-${color} h-100`}>
    <Card.Body className="d-flex justify-content-between align-items-center p-4">
      <div>
        <div className="fs-1 fw-bold">{value}</div>
        <div className="fs-6 opacity-75">{title}</div>
      </div>
      <div style={{ fontSize: '3rem', opacity: 0.7 }}>{icon}</div>
    </Card.Body>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/tasks/stats');
        setStats(res.data.stats);
      } catch (err) {
        setError('Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <AppNavbar />
      <Container className="py-4">
        {/* Welcome Header */}
        <div className="mb-4">
          <h2 className="fw-bold">Welcome back, {user?.name}! 👋</h2>
          <p className="text-muted">Here's an overview of your tasks.</p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {/* Stats Cards */}
            <Row className="g-4 mb-5">
              <Col xs={6} md={3}>
                <StatCard title="Total Tasks"   value={stats?.total || 0}       color="primary"   icon="📋" />
              </Col>
              <Col xs={6} md={3}>
                <StatCard title="To Do"         value={stats?.todo || 0}        color="secondary" icon="📝" />
              </Col>
              <Col xs={6} md={3}>
                <StatCard title="In Progress"   value={stats?.in_progress || 0} color="warning"   icon="🔄" />
              </Col>
              <Col xs={6} md={3}>
                <StatCard title="Completed"     value={stats?.done || 0}        color="success"   icon="✅" />
              </Col>
            </Row>

            {/* Progress Bar */}
            {stats?.total > 0 && (
              <Card className="border-0 shadow-sm mb-5">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="fw-semibold mb-0">Overall Progress</h6>
                    <span className="text-muted small">
                      {stats.done} of {stats.total} completed
                    </span>
                  </div>
                  <div className="progress" style={{ height: '12px' }}>
                    <div
                      className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{ width: `${Math.round((stats.done / stats.total) * 100)}%` }}
                    />
                  </div>
                  <small className="text-muted mt-1 d-block">
                    {Math.round((stats.done / stats.total) * 100)}% complete
                  </small>
                </Card.Body>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4 text-center">
                <h5 className="fw-semibold mb-3">Quick Actions</h5>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Button as={Link} to="/tasks" variant="primary" size="lg">
                    📋 View All Tasks
                  </Button>
                  <Button as={Link} to="/tasks?create=true" variant="success" size="lg">
                    ➕ Create New Task
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </>
  );
};

export default Dashboard;
