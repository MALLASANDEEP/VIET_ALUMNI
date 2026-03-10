-- Connection requests between approved users
CREATE TABLE public.connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT connection_requests_no_self CHECK (sender_profile_id <> receiver_profile_id)
);

-- One active pending request in each direction at a time
CREATE UNIQUE INDEX connection_requests_unique_pending
  ON public.connection_requests (sender_profile_id, receiver_profile_id)
  WHERE status = 'pending';

CREATE INDEX connection_requests_receiver_idx ON public.connection_requests (receiver_profile_id, created_at DESC);
CREATE INDEX connection_requests_sender_idx ON public.connection_requests (sender_profile_id, created_at DESC);

-- Accepted connections for chat access
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_one_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_two_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT connections_no_self CHECK (profile_one_id <> profile_two_id),
  CONSTRAINT connections_ordered_pair CHECK (profile_one_id < profile_two_id),
  UNIQUE (profile_one_id, profile_two_id)
);

CREATE INDEX connections_profile_one_idx ON public.connections (profile_one_id);
CREATE INDEX connections_profile_two_idx ON public.connections (profile_two_id);

-- Chat messages scoped to accepted connections
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_connection_idx ON public.chat_messages (connection_id, created_at ASC);
CREATE INDEX chat_messages_sender_idx ON public.chat_messages (sender_profile_id, created_at DESC);

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Requests are visible to sender/receiver
CREATE POLICY "Participants can view connection requests" ON public.connection_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id IN (sender_profile_id, receiver_profile_id)
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  );

-- Sender creates request from own approved profile
CREATE POLICY "Approved users can send connection requests" ON public.connection_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p_sender
      WHERE p_sender.id = sender_profile_id
        AND p_sender.user_id = auth.uid()
        AND p_sender.status = 'approved'
    )
    AND EXISTS (
      SELECT 1
      FROM public.profiles p_receiver
      WHERE p_receiver.id = receiver_profile_id
        AND p_receiver.status = 'approved'
    )
    AND sender_profile_id <> receiver_profile_id
  );

-- Receiver can accept/reject by updating request status
CREATE POLICY "Receiver can respond to connection requests" ON public.connection_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = receiver_profile_id
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = receiver_profile_id
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  );

-- Connections are visible to participants
CREATE POLICY "Participants can view connections" ON public.connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id IN (profile_one_id, profile_two_id)
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  );

-- A participant can create connection rows (done on accept)
CREATE POLICY "Participants can create connections" ON public.connections
  FOR INSERT WITH CHECK (
    status = 'active'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id IN (profile_one_id, profile_two_id)
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  );

-- Participants can view messages in their own connections
CREATE POLICY "Participants can view chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.connections c
      JOIN public.profiles p ON p.id IN (c.profile_one_id, c.profile_two_id)
      WHERE c.id = connection_id
        AND c.status = 'active'
        AND p.user_id = auth.uid()
        AND p.status = 'approved'
    )
  );

-- Participant can send as self only
CREATE POLICY "Participants can send chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles sender
      JOIN public.connections c
        ON c.id = connection_id
       AND sender.id = sender_profile_id
       AND sender.id IN (c.profile_one_id, c.profile_two_id)
      WHERE sender.user_id = auth.uid()
        AND sender.status = 'approved'
        AND c.status = 'active'
    )
  );

-- Sender can delete their own messages
CREATE POLICY "Senders can delete their own messages" ON public.chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.profiles sender
      JOIN public.connections c
        ON c.id = connection_id
       AND sender.id = sender_profile_id
       AND sender.id IN (c.profile_one_id, c.profile_two_id)
      WHERE sender.user_id = auth.uid()
        AND sender.status = 'approved'
        AND c.status = 'active'
    )
  );

CREATE TRIGGER update_connection_requests_updated_at
  BEFORE UPDATE ON public.connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
