import { useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { Category } from '../settings/CategoryManager';

export function ImportCSV() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ success: 0, failed: 0 });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.get<Category[]>('/api/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError('');

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      
      if (lines.length <= 1) {
        throw new Error('CSV file is empty or missing data rows.');
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const dateIdx = headers.indexOf('date');
      const descIdx = headers.indexOf('description');
      const amountIdx = headers.indexOf('amount');
      const catIdx = headers.indexOf('category');
      const typeIdx = headers.indexOf('type');

      if (dateIdx === -1 || descIdx === -1 || amountIdx === -1 || catIdx === -1 || typeIdx === -1) {
        throw new Error('CSV must contain headers: Date, Description, Amount, Category, Type');
      }

      let successCount = 0;
      let failedCount = 0;

      // Process each row sequentially to respect database constraints and check budget warnings
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        
        // Simple comma splitting that handles simple rows
        const cols = row.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < headers.length) continue;

        try {
          const rawDate = cols[dateIdx];
          const name = cols[descIdx];
          const rawAmount = parseFloat(cols[amountIdx]);
          const rawCategory = cols[catIdx];
          const rawType = cols[typeIdx].toLowerCase();

          if (!name || isNaN(rawAmount) || !rawCategory || !rawType) {
            failedCount++;
            continue;
          }

          const type = (rawType === 'income' || rawType === 'expense') ? rawType : 'expense';
          const amount = Math.abs(rawAmount);
          const date = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

          // Match category (case insensitive matching)
          let categoryObj = categories.find(
            cat => cat.name.toLowerCase() === rawCategory.toLowerCase() && cat.type === type
          );

          // Fallback to first matched category of the same type if not found
          if (!categoryObj) {
            categoryObj = categories.find(cat => cat.type === type);
          }

          if (!categoryObj) {
            failedCount++;
            continue;
          }

          await apiClient.post('/api/transactions', {
            name,
            amount,
            type,
            category: categoryObj._id,
            date,
          });

          successCount++;
        } catch (err) {
          console.error(`Row ${i} failed to import:`, err);
          failedCount++;
        }
      }

      setStats({ success: successCount, failed: failedCount });
      setImported(true);

      setTimeout(() => {
        navigate('/app/transactions');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import CSV file');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      <Link to="/app/transactions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Transactions
      </Link>

      <h1 className="text-3xl font-bold">Import from CSV</h1>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
          {error}
        </div>
      )}

      {!imported ? (
        <>
          <Card>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">CSV Format Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Your CSV file should include the following columns (headers are case-insensitive):
              </p>
              <div className="bg-muted rounded-lg p-4 text-sm font-mono text-foreground">
                Date, Description, Amount, Category, Type
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Date:</strong> YYYY-MM-DD format (e.g., 2026-04-24)</p>
                <p><strong className="text-foreground">Description:</strong> Transaction name or description</p>
                <p><strong className="text-foreground">Amount:</strong> Numeric value (e.g. 54.50 or -54.50)</p>
                <p><strong className="text-foreground">Category:</strong> Matching category name (e.g. Food & Dining)</p>
                <p><strong className="text-foreground">Type:</strong> Either "income" or "expense"</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                {!file ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-2">Upload CSV File</p>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your file here, or click to browse
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <Button type="button">
                        Choose File
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {file && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={handleImport}
                    disabled={importing}
                  >
                    {importing ? 'Importing Transactions...' : 'Import Transactions'}
                  </Button>
                  <Link to="/app/transactions" className="flex-1">
                    <Button variant="outline" className="w-full" disabled={importing}>
                      Cancel
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center space-y-6 py-12">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Import Complete!</h3>
              <p className="text-muted-foreground">
                Successfully imported <strong>{stats.success}</strong> transactions.
                {stats.failed > 0 && ` Failed to import ${stats.failed} rows.`}
              </p>
              <p className="text-sm text-muted-foreground mt-4 animate-pulse">
                Redirecting back to transactions list...
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
