export async function translateToMarathi(text) {
    if (!text || text.trim() === "") return "";
  
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|mr`
      );
      const data = await response.json();
  
      if (data?.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
      return text; // fallback if translation fails
    } catch (error) {
      console.error("Translation error:", error);
      return text; // fallback
    }
  }
  