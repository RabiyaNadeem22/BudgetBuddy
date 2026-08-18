import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

export interface Category {
  _id: string;
  userId?: string | null;
  name: string;
  color: string;
  type: 'income' | 'expense';
}

const colorOptions = ['#4CAF50', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#06B6D4', '#6366F1'];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#4CAF50',
    type: 'expense' as 'income' | 'expense',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Category[]>('/api/categories');
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const updated = await apiClient.put<Category>(`/api/categories/${id}`, {
        name: editName,
        color: editColor,
      });
      setCategories(categories.map(cat => cat._id === id ? updated : cat));
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Any associated budgets will be cleared.')) {
      return;
    }
    try {
      await apiClient.delete(`/api/categories/${id}`);
      setCategories(categories.filter(cat => cat._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      const created = await apiClient.post<Category>('/api/categories', newCategory);
      setCategories([...categories, created]);
      setNewCategory({ name: '', color: '#4CAF50', type: 'expense' });
      setShowAddForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Manager</h1>
          <p className="text-muted-foreground">Customize your income and expense categories</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Enter category name"
            />

            <div>
              <label className="block mb-3 text-sm font-medium">Category Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    newCategory.type === 'income'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    newCategory.type === 'expense'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-3 text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      newCategory.color === color ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddCategory} disabled={!newCategory.name.trim()}>
                Add Category
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Income Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {incomeCategories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
              >
                {editingId === category._id ? (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <select
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer text-foreground bg-background"
                        style={{ backgroundColor: editColor }}
                      >
                        {colorOptions.map((color) => (
                          <option key={color} value={color} className="text-black bg-white">
                            {color}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(category._id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                      {!category.userId && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {category.userId && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(category)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(category._id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expenseCategories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
              >
                {editingId === category._id ? (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <select
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer text-foreground bg-background"
                        style={{ backgroundColor: editColor }}
                      >
                        {colorOptions.map((color) => (
                          <option key={color} value={color} className="text-black bg-white">
                            {color}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(category._id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                      {!category.userId && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {category.userId && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(category)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(category._id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
