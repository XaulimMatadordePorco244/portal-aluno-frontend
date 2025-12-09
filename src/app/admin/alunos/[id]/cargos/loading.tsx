import { Card, Skeleton, Row, Col } from 'antd';

export default function AlunoCargosLoading() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>

      <Skeleton active paragraph={{ rows: 0 }} style={{ marginBottom: 16 }} />
      

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Skeleton active avatar paragraph={{ rows: 3 }} />
          </Col>
          <Col xs={24} md={8}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Col>
          <Col xs={24} md={8}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Col>
        </Row>
      </Card>
      

      <Skeleton active style={{ marginBottom: 24 }} />

      <Card>
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </Card>
    </div>
  );
}