export async function getSesMessageId(
    emailId: string,
    apiKey = process.env.RESEND_API_KEY!
  ): Promise<string | null> {
    const base = 'https://api.resend.com/emails';
  
    const first = await fetch(`${base}/${emailId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (first.ok) {
      const body = await first.json();
      const msg = body?.data?.headers?.['Message-ID'] as string | undefined;
      if (msg) return msg.replace(/[<>]/g, '');
    }


    let delay = 1000;
    const deadline = Date.now() + 25_000;
    while (Date.now() < deadline) {
      const r = await fetch(`${base}/${emailId}/events?limit=5`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!r.ok) {
        console.warn('events fetch', r.status, await r.text());
        break;
      }
      const { data } = await r.json();
      const delivered = data.find((e: any) => e.type === 'delivered');
      const id = delivered?.metadata?.ses?.messageId;
      if (id) return id;
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, 8000);
    }
    return null;
  }