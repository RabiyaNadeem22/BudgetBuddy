import { useNavigate, Link } from 'react-router';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Upload, FileText, CheckCircle2 } from 'lucide-react';

export function ImportCSV() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImported(true);
      setTimeout(() => {
        navigate('/app/transactions');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      <Link to="/app/transactions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back to Transactions
      </Link>

      <h1 className="text-3xl font-bold">Import from CSV</h1>

      {!imported ? (
        <>
          <Card>
            <div className="space-y-4">
              <h3 className="font-semibold">CSV Format Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Your CSV file should include the following columns:
              </p>
              <div className="bg-muted rounded-lg p-4 text-sm font-mono">
                Date, Description, Amount, Category, Type
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Date:</strong> YYYY-MM-DD format (e.g., 2026-04-24)</p>
                <p><strong>Description:</strong> Transaction name or description</p>
                <p><strong>Amount:</strong> Numeric value (use negative for expenses)</p>
                <p><strong>Category:</strong> Category name</p>
                <p><strong>Type:</strong> Either "income" or "expense"</p>
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
                      <p className="font-medium">{file.name}</p>
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
                    {importing ? 'Importing...' : 'Import Transactions'}
                  </Button>
                  <Link to="/app/transactions" className="flex-1">
                    <Button variant="outline" className="w-full">
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
              <h3 className="text-2xl font-bold mb-2">Import Successful!</h3>
              <p className="text-muted-foreground">
                Your transactions have been imported successfully
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
