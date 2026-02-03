import { useState, useEffect, useId } from 'react';
import { toast } from 'sonner';
import { Copy, Trash2, Plus, Link, Calendar, Clock } from 'lucide-react';
import { generateToken, decodeTokenExpiry } from '@/lib/tokenUtils';
import {
  getStoredTokens,
  saveToken,
  deleteToken,
  isTokenExpired,
  generateTokenId,
  type StoredToken,
} from '@/lib/tokenStorage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PageShell from '@/components/layout/PageShell';

type ValidityOption = '7' | '30' | '90';

export default function Admin() {
  const [tokens, setTokens] = useState<StoredToken[]>([]);
  const [clientName, setClientName] = useState('');
  const [validity, setValidity] = useState<ValidityOption>('30');
  const [dialogOpen, setDialogOpen] = useState(false);

  const clientNameId = useId();
  const validityId = useId();

  // Load tokens from localStorage on mount
  useEffect(() => {
    setTokens(getStoredTokens());
  }, []);

  const handleGenerate = () => {
    const days = parseInt(validity, 10);
    const token = generateToken(days);
    const fullUrl = `${window.location.origin}/calculator?token=${token}`;
    const expiryDate = decodeTokenExpiry(token);

    const newToken: StoredToken = {
      id: generateTokenId(),
      clientName: clientName.trim() || 'Unnamed Client',
      token,
      createdAt: new Date().toISOString(),
      expiresAt: expiryDate ? expiryDate.toISOString() : '',
      fullUrl,
    };

    saveToken(newToken);
    setTokens(getStoredTokens());
    setClientName('');
    setDialogOpen(false);
    toast.success('Link generated successfully');
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleDelete = (id: string) => {
    deleteToken(id);
    setTokens(getStoredTokens());
    toast.success('Link deleted');
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-qurate-light text-2xl md:text-3xl font-bold">
              Admin Dashboard
            </h1>
            <p className="text-qurate-muted mt-1">
              Manage client calculator access links
            </p>
          </div>

          {/* Generate New Link Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-qurate-gold hover:bg-qurate-gold/90 text-qurate-slate font-semibold">
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Generate New Link
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-qurate-slate-light border-qurate-slate-light/30 text-qurate-light">
              <DialogHeader>
                <DialogTitle className="text-qurate-light">Generate Client Link</DialogTitle>
                <DialogDescription className="text-qurate-muted">
                  Create a time-limited access link for a client
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor={clientNameId} className="text-qurate-light">
                    Client Name (optional)
                  </Label>
                  <Input
                    id={clientNameId}
                    placeholder="e.g. Clipex Pty Ltd"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-qurate-slate border-qurate-slate-light/50 text-qurate-light placeholder:text-qurate-muted/50"
                  />
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-qurate-light font-medium text-sm" id={validityId}>
                    Link Validity
                  </legend>
                  <RadioGroup
                    value={validity}
                    onValueChange={(val) => setValidity(val as ValidityOption)}
                    aria-labelledby={validityId}
                    className="grid grid-cols-3 gap-3"
                  >
                    {[
                      { value: '7', label: '7 days' },
                      { value: '30', label: '30 days' },
                      { value: '90', label: '90 days' },
                    ].map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={`validity-${option.value}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`validity-${option.value}`}
                          className="flex items-center justify-center rounded-md border-2 border-qurate-slate-light/50 bg-qurate-slate py-3 px-4 cursor-pointer hover:bg-qurate-slate-light/20 peer-data-[state=checked]:border-qurate-gold peer-data-[state=checked]:bg-qurate-gold/10 text-qurate-light transition-colors"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </fieldset>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-qurate-slate-light/50 text-qurate-light hover:bg-qurate-slate"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="bg-qurate-gold hover:bg-qurate-gold/90 text-qurate-slate font-semibold"
                >
                  Generate Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Token Table */}
        <Card className="bg-qurate-slate-light border-qurate-slate-light/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-qurate-light text-lg flex items-center gap-2">
              <Link className="w-5 h-5" aria-hidden="true" />
              Client Links
            </CardTitle>
            <CardDescription className="text-qurate-muted">
              {tokens.length} link{tokens.length !== 1 ? 's' : ''} generated
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {tokens.length === 0 ? (
              <div className="p-8 text-center text-qurate-muted">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                <p>No links generated yet</p>
                <p className="text-sm mt-1">
                  Click "Generate New Link" to create your first client link
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-qurate-slate-light/30 hover:bg-transparent">
                      <TableHead className="text-qurate-muted">Client</TableHead>
                      <TableHead className="text-qurate-muted">Created</TableHead>
                      <TableHead className="text-qurate-muted">Expires</TableHead>
                      <TableHead className="text-qurate-muted">Status</TableHead>
                      <TableHead className="text-qurate-muted text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => {
                      const expired = isTokenExpired(token.expiresAt);
                      return (
                        <TableRow
                          key={token.id}
                          className="border-qurate-slate-light/20 hover:bg-qurate-slate/50"
                        >
                          <TableCell className="text-qurate-light font-medium">
                            {token.clientName}
                          </TableCell>
                          <TableCell className="text-qurate-light">
                            {formatDate(token.createdAt)}
                          </TableCell>
                          <TableCell className="text-qurate-light">
                            {formatDate(token.expiresAt)}
                          </TableCell>
                          <TableCell>
                            {expired ? (
                              <Badge
                                variant="destructive"
                                className="bg-red-500/20 text-red-400 border-red-500/30"
                              >
                                <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                                Expired
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(token.fullUrl)}
                                className="text-qurate-muted hover:text-qurate-light hover:bg-qurate-slate"
                                aria-label={`Copy link for ${token.clientName}`}
                              >
                                <Copy className="w-4 h-4" aria-hidden="true" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(token.id)}
                                className="text-qurate-muted hover:text-red-400 hover:bg-red-500/10"
                                aria-label={`Delete link for ${token.clientName}`}
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
