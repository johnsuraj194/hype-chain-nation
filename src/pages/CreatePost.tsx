import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";

const CreatePost = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!image) {
      toast({
        title: "Image required",
        description: "Please select an image to post",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload image
      const fileExt = image.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from("post-images")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      // Create post
      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.id,
        image_url: publicUrl,
        caption: caption.trim() || null,
      });

      if (postError) throw postError;

      toast({
        title: "Posted! 🎉",
        description: "Your post is live on HypeChain",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold">Create Post</h1>
        </div>

        <div className="bg-card rounded-2xl p-6 space-y-6 shadow-card border border-border">
          {/* Image Upload */}
          <div>
            <label className="block mb-2 text-sm font-medium">Photo</label>
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-xl"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                  }}
                  className="absolute top-4 right-4"
                >
                  Change
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Click to upload image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block mb-2 text-sm font-medium">Caption</label>
            <Textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px] bg-background"
            />
          </div>

          {/* Post Button */}
          <Button
            onClick={handlePost}
            disabled={uploading || !image}
            className="w-full bg-gradient-primary hover:opacity-90 text-white font-bold h-12"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Share to HypeChain"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CreatePost;
