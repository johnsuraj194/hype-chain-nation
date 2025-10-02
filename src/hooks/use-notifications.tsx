import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = (userId?: string) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "hype_transactions",
          filter: `to_user_id=eq.${userId}`,
        },
        async (payload: any) => {
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.from_user_id)
            .single();

          if (senderProfile) {
            toast({
              title: "New HYPE received!",
              description: `${senderProfile.username} gave you ${payload.new.creator_amount} HYPE`,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=in.(select id from posts where user_id=${userId})`,
        },
        async (payload: any) => {
          const { data: commenterProfile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.user_id)
            .single();

          if (commenterProfile) {
            toast({
              title: "New comment",
              description: `${commenterProfile.username} commented on your post`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);
};
