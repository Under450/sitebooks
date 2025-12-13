'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/formatting';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  item_order: number;
}

interface InvoiceItemsManagerProps {
  jobId: string;
  userId: string;
  onUpdate: () => void;
}

export function InvoiceItemsManager({ jobId, userId, onUpdate }: InvoiceItemsManagerProps) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    quantity: '1',
    unit_price: '',
  });

  useEffect(() => {
    loadItems();
  }, [jobId]);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('job_id', jobId)
        .order('item_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading invoice items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!formData.description.trim() || !formData.unit_price) {
      alert('Please fill in description and price');
      return;
    }

    try {
      const quantity = parseFloat(formData.quantity) || 1;
      const unitPrice = parseFloat(formData.unit_price);
      const amount = quantity * unitPrice;

      const { error } = await supabase.from('invoice_items').insert({
        user_id: userId,
        job_id: jobId,
        description: formData.description,
        quantity,
        unit_price: unitPrice,
        amount,
        item_order: items.length,
      });

      if (error) throw error;

      await loadItems();
      onUpdate();
      
      setFormData({ description: '', quantity: '1', unit_price: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const { error } = await supabase
        .from('invoice_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await loadItems();
      onUpdate();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return <div className="text-center py-4">Loading items...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Items List */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-bold text-charcoal mb-3">Invoice Items</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold">{item.description}</div>
                  <div className="text-sm text-gray-600">
                    {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.amount)}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-cost text-sm ml-3"
                >
                  🗑️
                </button>
              </div>
            ))}
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="font-bold">Total:</span>
              <span className="text-xl font-bold text-profit">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Button/Form */}
      {!showAddForm ? (
        <Button onClick={() => setShowAddForm(true)} fullWidth variant="primary">
          ➕ Add Invoice Item
        </Button>
      ) : (
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
          <h3 className="font-bold text-charcoal">Add Line Item</h3>
          
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Painting - Living Room"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="1"
            />

            <Input
              label="Unit Price (£)"
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              placeholder="500.00"
            />
          </div>

          {/* Preview Total */}
          {formData.unit_price && (
            <div className="bg-amber/10 rounded-lg p-3 border border-amber/30">
              <div className="flex justify-between text-sm">
                <span>Line Total:</span>
                <span className="font-bold">
                  {formatCurrency((parseFloat(formData.quantity) || 1) * parseFloat(formData.unit_price))}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleAddItem} fullWidth variant="primary">
              ✓ Add Item
            </Button>
            <Button onClick={() => setShowAddForm(false)} fullWidth variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
