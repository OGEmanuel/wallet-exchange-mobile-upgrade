import React from 'react';
import {Text, View, StyleSheet} from 'react-native';

const ArticleParser = ({text}: {text: string}) => {
  // Helper function to split text into paragraphs
  const splitIntoParagraphs = (text: string) => {
    // Split text by periods followed by spaces/newlines (can be customized further)
    const paragraphs = text.split(/(?<=\.)\s+(?=[A-Z])/g); // Split after a period if the next part starts with a capital letter
    return paragraphs.map(paragraph => paragraph.trim()); // Trim whitespace around paragraphs
  };

  // Helper function to parse bold text
  const parseBoldText = (paragraph: string) => {
    // Example regex: Bold capitalized phrases or keywords (customize this regex)
    const boldRegex = /(\b[A-Z][a-zA-Z0-9]+\b(?:\s[A-Z][a-zA-Z0-9]+)*)/g;

    // Split paragraph into parts based on matches
    const parts = paragraph.split(boldRegex);

    return parts.map((part, index) =>
      boldRegex.test(part) ? (
        <Text key={index} style={styles.bold}>
          {part}
        </Text>
      ) : (
        part
      ),
    );
  };

  // Parse and render the paragraphs
  const renderParagraphs = (text: string) => {
    const paragraphs = splitIntoParagraphs(text);

    return paragraphs.map((paragraph, index) => (
      <Text key={index} style={[styles.paragraph, index > 0 && styles.spacing]}>
        {parseBoldText(paragraph)}
      </Text>
    ));
  };

  return <View style={styles.container}>{renderParagraphs(text)}</View>;
};

export default ArticleParser;

const styles = StyleSheet.create({
  container: {
    marginBottom: 200,
  },
  spacing: {
    marginTop: 12, // Add spacing between paragraphs
  },
  paragraph: {
    fontWeight: '700',
    color: '#A7A7AF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 20,
  },
  bold: {
    fontWeight: '900',
  },
});
