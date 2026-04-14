# ⚠️ REMAINING ISSUES TO FIX (Priority Order)

## Priority 1: useAllConnectionsUnread.js - Chat Polling Too Aggressive

**Severity:** 🟠 HIGH  
**File:** `src/hooks/useAllConnectionsUnread.js`  
**Line:** ~32

### Current Code:
```javascript
export const useAllConnectionsUnread = (connections = [], profileId) => {
    // ...
    const messageQueries = useQueries({
        queries: connections.map((connection) => ({
            queryKey: ["chat", "unread", connection.id],
            queryFn: async () => {
                const { data, error } = await supabase
                    .from("chat_messages")
                    .select("id, sender_profile_id, created_at")
                    .eq("connection_id", connection.id)
                    .order("created_at", { ascending: false })
                    .limit(50);
                if (error) throw error;
                return { connectionId: connection.id, messages: data || [] };
            },
            enabled: !!connection.id && !!profileId,
            refetchInterval: 3000,  // ❌ PROBLEM: Polls every 3 seconds!
            staleTime: 0,
        })),
    });
};
```

### Why It's a Problem:
```
If user has 10 connections:
- Polls every 3 seconds
- 10 API calls × 1 poll = 10 calls per 3 seconds
- = 200 API calls per minute! 🔴

Over 1 hour: 12,000 unnecessary API calls
Over 1 day: 288,000 unnecessary API calls
```

### Solution:
```javascript
// Change this:
refetchInterval: 3000,

// To this:
refetchInterval: 30000,  // Poll every 30 seconds instead
```

**Or better yet - Use Supabase Real-time:**
```javascript
// Real-time subscription (true push, not polling)
const messageSubscription = supabase
    .channel(`connection:${connection.id}`)
    .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
            // Update unread count immediately
            queryClient.invalidateQueries({ queryKey: ["chat", "unread"] });
        }
    )
    .subscribe();

// Cleanup subscription on unmount
return () => {
    supabase.removeChannel(messageSubscription);
};
```

**Expected Improvement:** 
- ❌ Before: 12,000+ API calls/hour
- ✅ After: 120 API calls/hour (30-second interval)
- ✅ Real-time: Near-instant unread updates

---

## Priority 2: useGallery.js - Missing Limit

**Severity:** 🟠 HIGH  
**File:** `src/hooks/useGallery.js`  
**Line:** ~18

### Current Code:
```javascript
export const useGallery = () => {
    return useQuery({
        queryKey: ["gallery"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("gallery_images")
                .select("id, title, category, description, image_url, created_at")
                .order("created_at", { ascending: false });
                // ❌ NO LIMIT! Could fetch 1000s of images!
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60,
    });
};
```

### Fix:
```javascript
export const useGallery = () => {
    return useQuery({
        queryKey: ["gallery"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("gallery_images")
                .select("id, title, category, description, image_url, created_at")
                .order("created_at", { ascending: false })
                .limit(100);  // ✅ Only fetch first 100 images
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60,
    });
};
```

**Or use pagination:**
```javascript
export const useGallery = (pageSize = 20, pageIndex = 0) => {
    return useQuery({
        queryKey: ["gallery", pageIndex],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("gallery_images")
                .select("id, title, category, description, image_url, created_at")
                .order("created_at", { ascending: false })
                .range(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1);
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60,
    });
};
```

**Expected Improvement:**
- ❌ Before: Could fetch 1000+ images (2-3 MB)
- ✅ After: Max 100 images (200-300 KB)
- ✅ **90% payload reduction**

---

## Priority 3: AdminAlumniHeroEditor.jsx - Duplicate Data Fetching

**Severity:** 🟠 MEDIUM  
**File:** `src/components/admin/AdminAlumniHeroEditor.jsx`  
**Line:** ~1

### Current Code:
```javascript
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminAlumniHeroEditor = () => {
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(false);

    // ❌ DUPLICATE FETCH (same as useAlumniHero hook!)
    useEffect(() => {
        const fetchHero = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("alumni_hero")
                .select("*")  // ❌ Also using .select("*")!
                .single();
            if (error) {
                console.error(error);
                toast({ title: "Failed to load hero", variant: "destructive" });
            } else if (data) {
                setHero(data);
            }
            setLoading(false);
        };
        fetchHero();
    }, []);

    const handleSave = async () => {
        if (!hero) return;
        setLoading(true);
        // ... save logic
    };

    return (
        // ... UI
    );
};
```

### Why It's Bad:
1. **Duplicate fetch** - useAlumniHero hook also fetches same data
2. **Cache not shared** - Admin page does 2nd request unnecessarily
3. **Manual state management** - Not using React Query
4. **No auto-invalidation** - Manual update doesn't reflect to other pages

### Fix:
```javascript
import { useAlumniHero, useUpdateAlumniHero } from "@/hooks/useAlumniHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const AdminAlumniHeroEditor = () => {
    // ✅ Use the hook (shared cache)
    const { data: hero, isLoading } = useAlumniHero();
    const { mutate: updateMutation, isPending: isUpdating } = useUpdateAlumniHero();

    const handleSave = async (updates) => {
        try {
            // ✅ Mutation automatically invalidates cache
            await updateMutation({ ...hero, ...updates });
            toast({ 
                title: "Success", 
                description: "Alumni hero updated" 
            });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: error.message,
                variant: "destructive"
            });
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (!hero) return <div>No hero found</div>;

    return (
        <div>
            {/* Form fields using hero data */}
            <Input 
                defaultValue={hero.title}
                onChange={(e) => handleSave({ title: e.target.value })}
            />
            {/* ... other fields */}
        </div>
    );
};

export default AdminAlumniHeroEditor;
```

**Benefits:**
- ✅ No duplicate fetch
- ✅ Cache automatically shared across pages
- ✅ Admin edits immediately reflect on home page
- ✅ Automatic invalidation on save
- ✅ Better error handling

---

## Priority 4: Add Image Lazy Loading (Optional)

**Severity:** 🟡 LOW  
**Files:** Multiple (GallerySection, AlumniMarquee, etc.)

### Current Code:
```javascript
<img src={alumni.photo_url} alt={alumni.name} className="w-full h-full object-cover"/>
```

### Optimized Code:
```javascript
<img 
    src={alumni.photo_url} 
    alt={alumni.name} 
    className="w-full h-full object-cover"
    loading="lazy"  // ✅ Only load when near viewport
    decoding="async"  // ✅ Don't block rendering
/>
```

**Or use React Lazy Image Library:**
```javascript
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
    src={alumni.photo_url}
    alt={alumni.name}
    effect="blur"
    className="w-full h-full object-cover"
/>
```

---

## Priority 5: Bundle Analysis (Optional)

**Severity:** 🟡 LOW  
**Goal:** Identify large dependencies

### Check Bundle Size:
```bash
npm install -D @vitejs/plugin-vue
npm run build
# Check dist folder size

# Or use: vite-plugin-visualizer
npm install -D rollup-plugin-visualizer
```

### Common Culprits:
- `framer-motion` (10KB) - Needed for animations
- `react-router-dom` (6KB) - Needed for routing
- `@tanstack/react-query` (8KB) - Worth it for caching

---

## Implementation Checklist

### Phase 1 (Critical - Do Now):
- [ ] Fix useAllConnectionsUnread.js (refetchInterval)
- [ ] Add .limit() to useGallery.js
- [ ] Update AdminAlumniHeroEditor to use hooks

### Phase 2 (Good to Have - This Week):
- [ ] Add lazy loading to images
- [ ] Run bundle analysis
- [ ] Monitor performance after Phase 1

### Phase 3 (Nice to Have - Next Sprint):
- [ ] Implement real-time subscriptions for chat
- [ ] Implement pagination for gallery
- [ ] Consider service worker for offline support

---

## Performance Checklist After Fixes

After implementing all fixes, verify:

```
☑ Page load < 2 seconds (target: 1.5s)
☑ Lighthouse score > 80 (target: 90+)
☑ FCP < 1 second (First Contentful Paint)
☑ LCP < 2.5 seconds (Largest Contentful Paint)
☑ CLS < 0.1 (Cumulative Layout Shift)
☑ No jank on interactions (60 FPS)
☑ API calls < 50/minute (chat disabled)
☑ Network payload < 200KB (initial load)
```

---

## Tools to Monitor

1. **Chrome DevTools → Lighthouse** - Full audit
2. **Chrome → Performance Tab** - Record and analyze
3. **Network Tab** - Check payload sizes
4. **Console → React Query DevTools** - Monitor cache

Add React Query DevTools to troubleshoot:
```bash
npm install -D @tanstack/react-query-devtools
```

```javascript
// App.jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
    {/* ... */}
    <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

**Estimated Time to Complete All Fixes:** 1-2 hours  
**Expected Performance Gain:** Additional 20-30% improvement
