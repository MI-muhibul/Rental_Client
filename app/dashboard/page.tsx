import React from 'react';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Card, { CardBody, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const stats = [
    { label: 'Active Rentals', value: '4', change: '+1 this week' },
    { label: 'Total Hours Logged', value: '342 hrs', change: 'Fleet running at 94%' },
    { label: 'Upcoming Returns', value: '2 Units', change: 'Due in 48 hours' },
    { label: 'Total Invoiced', value: '$8,450', change: 'All payments verified' },
  ];

  return (
    <SectionContainer>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="hazard-badge mb-2">OPERATIONS CONSOLE</span>
          <Heading level={1} size="lg">
            Dashboard Overview
          </Heading>
        </div>
        <Button>+ Book New Equipment</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardBody>
              <CardContent>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-heading">
                  {stat.label}
                </span>
                <div className="text-3xl font-bold font-heading text-white mt-2">
                  {stat.value}
                </div>
              </CardContent>
              <CardFooter className="text-xs text-primary font-mono pt-3">
                {stat.change}
              </CardFooter>
            </CardBody>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}
