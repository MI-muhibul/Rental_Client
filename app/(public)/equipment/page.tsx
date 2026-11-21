import React from 'react';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Card, { CardBody, CardContent, CardFooter, CardImage } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function EquipmentCatalogPage() {
  const sampleEquipment = [
    {
      id: 'eq-1',
      name: 'CAT 320 Hydraulic Excavator',
      category: 'Heavy Earthmoving',
      price: 450,
      unit: 'day',
      quantity: 2,
      location: 'Dallas, TX',
      image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'eq-2',
      name: 'Komatsu WA380 Wheel Loader',
      category: 'Material Handling',
      price: 380,
      unit: 'day',
      quantity: 1,
      location: 'Houston, TX',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'eq-3',
      name: 'Dynapac CA2500 Soil Compactor',
      category: 'Compaction',
      price: 240,
      unit: 'day',
      quantity: 3,
      location: 'Austin, TX',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <SectionContainer>
      <div className="mb-10">
        <span className="hazard-badge mb-3">HEAVY INDUSTRIAL CATALOG</span>
        <Heading level={1} size="xl" className="mb-3">
          Equipment Fleet
        </Heading>
        <p className="text-gray-400 max-w-2xl text-base">
          Commercial grade excavators, loaders, and compaction gear. Fully inspected,
          certified, and ready for immediate job site dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleEquipment.map((item) => (
          <Card key={item.id}>
            <CardImage>
              <img src={item.image} alt={item.name} />
              <div className="absolute top-3 left-3">
                <span className="hazard-badge">{item.category}</span>
              </div>
            </CardImage>
            <CardBody>
              <CardContent>
                <Heading level={3} size="md" className="mb-2">
                  {item.name}
                </Heading>
                <p className="text-sm text-gray-400 mb-4">Location: {item.location}</p>
                <div className="text-xs text-gray-500 font-mono">
                  AVAILABILITY: {item.quantity} UNITS READY
                </div>
              </CardContent>
              <CardFooter>
                <div>
                  <span className="text-2xl font-bold font-heading text-primary">
                    ${item.price}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    /{item.unit}
                  </span>
                </div>
                <Button size="sm">Rent Now</Button>
              </CardFooter>
            </CardBody>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}
