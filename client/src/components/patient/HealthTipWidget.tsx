import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Lightbulb, RefreshCw } from 'lucide-react';

interface TipData {
  title: string;
  content: string;
}

const FALLBACK_TIPS: TipData[] = [
  {
    title: "Stay Hydrated",
    content: "Drinking at least 8 glasses of water daily helps maintain healthy bodily functions, improves energy levels, and supports overall well-being."
  },
  {
    title: "Get Quality Sleep",
    content: "Aim for 7-9 hours of sleep per night. Good sleep improves memory, boosts immunity, and reduces stress levels significantly."
  },
  {
    title: "Eat Colorful Foods",
    content: "Include a variety of colorful fruits and vegetables in your diet. Different colors provide different vitamins and antioxidants."
  },
  {
    title: "Move Every Hour",
    content: "Take short walks or stretch every hour. Regular movement improves circulation and reduces the risk of chronic diseases."
  },
  {
    title: "Practice Deep Breathing",
    content: "Deep breathing exercises can lower blood pressure, reduce anxiety, and improve focus. Try 5 deep breaths when stressed."
  },
  {
    title: "Limit Screen Time",
    content: "Reduce eye strain by following the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds."
  },
  {
    title: "Wash Hands Regularly",
    content: "Proper handwashing with soap for 20 seconds prevents the spread of infections and keeps you and your community healthy."
  },
  {
    title: "Eat Mindfully",
    content: "Chew your food slowly and savor each bite. Mindful eating aids digestion and helps prevent overeating."
  },
  {
    title: "Stay Socially Connected",
    content: "Regular social interaction boosts mental health, reduces depression risk, and may even improve longevity."
  },
  {
    title: "Protect Your Skin",
    content: "Apply sunscreen daily, even on cloudy days. UV protection prevents premature aging and reduces skin cancer risk."
  }
];

export const HealthTipWidget = () => {
  const [tip, setTip] = useState<TipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || '';
    
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length > 0) {
      text = sentences.slice(0, 3).join(' ').trim();
    } else {
      text = text.length > 200 ? text.substring(0, 200) + '...' : text;
    }
    
    return text.trim();
  };

  const getNextFallbackTip = () => {
    const nextIndex = (fallbackIndex + 1) % FALLBACK_TIPS.length;
    setFallbackIndex(nextIndex);
    setTip(FALLBACK_TIPS[nextIndex]);
    setUsingFallback(true);
    setLoading(false);
  };

  const fetchRandomTip = async () => {
    try {
      setLoading(true);
      
      // If already using fallback, just rotate to next tip
      if (usingFallback) {
        getNextFallbackTip();
        return;
      }

      // Try API first
      const listResponse = await fetch('https://odphp.health.gov/myhealthfinder/api/v4/itemlist.json?Type=topic');
      if (!listResponse.ok) throw new Error('Network response was not ok');
      const listData = await listResponse.json();
      
      const items = listData?.Result?.Items?.Item;
      if (!items || items.length === 0) throw new Error('No items found');

      const randomItem = items[Math.floor(Math.random() * items.length)];
      if (!randomItem?.Id) throw new Error('Invalid item');

      const detailResponse = await fetch(`https://odphp.health.gov/myhealthfinder/api/v4/topicsearch.json?TopicId=${randomItem.Id}`);
      if (!detailResponse.ok) throw new Error('Network response was not ok');
      const detailData = await detailResponse.json();

      const resource = detailData?.Result?.Resources?.Resource?.[0];
      if (!resource) throw new Error('No resource found');

      const title = resource.Title || randomItem.Title;
      const htmlContent = resource.Sections?.section?.[0]?.Description || '';
      
      const cleanContent = stripHtml(htmlContent);

      if (!cleanContent) throw new Error('No content available');

      setTip({
        title: title,
        content: cleanContent
      });
      setUsingFallback(false);
    } catch (err) {
      console.error('Error fetching health tip:', err);
      // Fall back to rotating tips
      getNextFallbackTip();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomTip();
  }, []);

  return (
    <Card className="border-border/60 shadow-premium-sm relative overflow-hidden bg-gradient-to-br from-card to-primary/5 h-full">
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-yellow-500/10 blur-2xl" />
      <CardHeader className="pb-4 px-6 pt-6">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
          <Lightbulb className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          Did You Know?
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4" />
            <p className="text-sm text-foreground/60">Fetching a health tip...</p>
          </div>
        ) : tip ? (
          <div className="space-y-5">
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-lg leading-tight">{tip.title}</h4>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {tip.content}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRandomTip}
              className="w-full gap-2 bg-background/50 hover:bg-background/80 transition-colors py-2 h-auto"
            >
              <RefreshCw className="h-4 w-4" />
              {usingFallback ? 'Next Tip' : 'Get Another Tip'}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
