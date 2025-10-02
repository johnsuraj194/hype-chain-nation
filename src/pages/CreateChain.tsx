import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader as Loader2 } from "lucide-react";

const CreateChain = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("chains")
        .insert({
          creator_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Chain created!",
        description: "Your chain is now live. Add posts to build momentum!",
      });
      navigate(`/chains/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6 animate-slide-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chains")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold">Create New Chain</h1>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card border border-border animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Chain Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summer Adventure Challenge"
                required
                className="bg-background"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this chain is about and what kind of posts should be added..."
                className="bg-background min-h-[120px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm">How Chains Work:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Create a theme or challenge for your chain</li>
                <li>• Others can add posts that continue the story</li>
                <li>• Each post that receives HYPE adds to the chain's total</li>
                <li>• Keep the momentum going with quality content</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/chains")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating || !title.trim()}
                className="flex-1 bg-gradient-primary hover:opacity-90 text-white font-bold"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Chain"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateChain;
