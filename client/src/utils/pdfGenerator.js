import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Svg,
  Path,
  Circle,
  Font,
} from "@react-pdf/renderer";

// Register Inter font for English reports
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "/fonts/Inter_18pt-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/Inter_18pt-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

// Register Cairo font for Arabic reports
Font.register({
  family: "Cairo",
  fonts: [
    {
      src: "/fonts/Cairo-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/Cairo-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

// Enhanced SVG Icon Components with proper PDF styling
const ChartIcon = () =>
  React.createElement(Svg, { width: 18, height: 18, viewBox: "0 0 24 24" }, [
    React.createElement(Path, {
      key: "path",
      d: "M3 3v18h18M7 16l4-4 4 4 6-6",
      stroke: "#10b981",
      strokeWidth: 2.5,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      fill: "none",
    }),
  ]);

const TrendingIcon = () =>
  React.createElement(Svg, { width: 18, height: 18, viewBox: "0 0 24 24" }, [
    React.createElement(Path, {
      key: "path",
      d: "M22 7l-8.5 8.5-5-5L2 17",
      stroke: "#14b8a6",
      strokeWidth: 2.5,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      fill: "none",
    }),
  ]);

const BulbIcon = () =>
  React.createElement(Svg, { width: 16, height: 16, viewBox: "0 0 24 24" }, [
    React.createElement(Circle, {
      key: "circle",
      cx: 12,
      cy: 10,
      r: 5,
      stroke: "#10b981",
      strokeWidth: 2,
      fill: "none",
    }),
    React.createElement(Path, {
      key: "path",
      d: "M10 15h4v3h-4z",
      stroke: "#10b981",
      strokeWidth: 2,
      fill: "none",
    }),
  ]);

const SparkleIcon = () =>
  React.createElement(Svg, { width: 16, height: 16, viewBox: "0 0 24 24" }, [
    React.createElement(Path, {
      key: "path",
      d: "M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7-5.5-4h7z",
      stroke: "#14b8a6",
      strokeWidth: 2,
      fill: "none",
    }),
  ]);

// Logo component with gradient effect
const LogoIcon = ({ isArabic }) =>
  React.createElement(Svg, { width: 48, height: 48, viewBox: "0 0 48 48" }, [
    // Background circle with gradient simulation
    React.createElement(Circle, {
      key: "bg",
      cx: 24,
      cy: 24,
      r: 24,
      fill: "#10b981",
    }),
    // Leaf icon
    React.createElement(Path, {
      key: "leaf",
      d: "M24 12c-6 0-10 4-10 10 0 4 2 7 5 8.5V36h10v-5.5c3-1.5 5-4.5 5-8.5 0-6-4-10-10-10z",
      fill: "#ffffff",
      opacity: 0.9,
    }),
    React.createElement(Path, {
      key: "stem",
      d: "M24 20v10",
      stroke: "#dcfce7",
      strokeWidth: 2,
      strokeLinecap: "round",
    }),
  ]);

// Enhanced Divider Component
const Divider = ({ color = "#e5e7eb", marginTop = 10, marginBottom = 10 }) =>
  React.createElement(View, {
    style: {
      height: 1,
      backgroundColor: color,
      marginTop,
      marginBottom,
      opacity: 0.5,
    },
  });

// Premium styles with enhanced design
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 70,
    paddingLeft: 45,
    paddingRight: 45,
    fontSize: 11,
    backgroundColor: "#ffffff",
  },

  // ===== HEADER STYLES =====
  header: {
    flexDirection: "row",
    marginBottom: 25,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    borderLeft: "5pt solid #10b981",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)",
  },
  logoContainer: {
    marginRight: 18,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#065f46",
    lineHeight: 1.4,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: "#059669",
    lineHeight: 1.5,
    letterSpacing: 0.2,
    fontWeight: 400,
  },

  // ===== METADATA STYLES =====
  metadata: {
    marginTop: 0,
    marginBottom: 25,
    padding: 18,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    border: "1pt solid #e5e7eb",
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 9,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: 700,
    marginBottom: 3,
  },
  metadataValue: {
    fontSize: 11,
    color: "#374151",
    fontWeight: 600,
    lineHeight: 1.6,
  },

  // ===== SECTION STYLES =====
  section: {
    marginBottom: 22,
    padding: 18,
    border: "1.5pt solid #e5e7eb",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
    color: "#10b981",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    borderLeft: "4pt solid #10b981",
    lineHeight: 1.5,
    letterSpacing: 0.2,
  },
  iconContainer: {
    marginRight: 10,
    marginLeft: 0,
  },
  iconContainerRTL: {
    marginLeft: 10,
    marginRight: 0,
  },
  sectionHeaderTeal: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
    color: "#14b8a6",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#f0fdfa",
    borderRadius: 8,
    borderLeft: "4pt solid #14b8a6",
    lineHeight: 1.5,
    letterSpacing: 0.2,
  },

  // ===== TEXT STYLES =====
  paragraph: {
    fontSize: 11,
    color: "#1f2937",
    lineHeight: 2.2,
    textAlign: "left",
    letterSpacing: 0.2,
    paddingLeft: 4,
    paddingRight: 4,
  },

  // ===== LIST STYLES =====
  listItem: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 14,
    paddingRight: 14,
    paddingLeft: 14,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderLeft: "3pt solid #d1fae5",
    alignItems: "flex-start",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  listItemAlternate: {
    backgroundColor: "#fefefe",
    borderLeft: "3pt solid #ccfbf1",
  },
  listNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 7,
    marginRight: 14,
    flexShrink: 0,
  },
  listBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#d1fae5",
    fontSize: 10,
    textAlign: "center",
    paddingTop: 7,
    marginRight: 14,
    flexShrink: 0,
    border: "2pt solid #10b981",
  },
  listText: {
    flex: 1,
    fontSize: 11,
    color: "#374151",
    lineHeight: 2.1,
    letterSpacing: 0.2,
    paddingTop: 3,
  },

  // ===== FOOTER STYLES =====
  footer: {
    position: "absolute",
    bottom: 30,
    left: 45,
    right: 45,
    paddingTop: 12,
    borderTop: "1pt solid #e5e7eb",
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
    letterSpacing: 0.3,
  },
  footerBrand: {
    fontSize: 9,
    color: "#10b981",
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  pageNumber: {
    fontSize: 9,
    color: "#6b7280",
    fontWeight: 600,
  },

  // ===== BADGE STYLES =====
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#d1fae5",
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 9,
    color: "#065f46",
    fontWeight: 700,
    letterSpacing: 0.5,
  },
});

// PDF Document Component - Returns a React PDF Document
const createAIReportDocument = (aiAnalysis, reportMetadata, isDetailed, language) => {
  const isArabic = language === "AR";

  const monthNamesLong = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthNamesArabic = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const translations = isArabic
    ? {
        title: isDetailed ? "تقرير أعمال مفصل بالذكاء الاصطناعي" : "رؤى الأعمال بالذكاء الاصطناعي",
        subtitle: "التحليل المهني والتوصيات الاستراتيجية",
        reportPeriod: "فترة التقرير",
        generated: "تاريخ الإصدار",
        languageLabel: "اللغة",
        reportType: "نوع التقرير",
        detailedAnalysis: "تحليل مفصل",
        summary: "تحليل موجز",
        executiveSummary: "الملخص التنفيذي",
        predictions: "التوقعات والتنبؤات",
        recommendations: "التوصيات الاستراتيجية",
        keyInsights: "الرؤى الأساسية",
        arabic: "العربية",
        english: "الإنجليزية",
        poweredBy: "مدعوم بواسطة AgriLink AI",
        confidential: "سري",
        pageOf: (num, total) => `صفحة ${num} من ${total}`,
      }
    : {
        title: isDetailed ? "Detailed AI Business Report" : "AI Business Insights",
        subtitle: "Professional Analysis & Strategic Recommendations",
        reportPeriod: "Report Period",
        generated: "Generated On",
        languageLabel: "Language",
        reportType: "Report Type",
        detailedAnalysis: "Detailed Analysis",
        summary: "Summary Analysis",
        executiveSummary: "Executive Summary",
        predictions: "Predictions & Forecasts",
        recommendations: "Strategic Recommendations",
        keyInsights: "Key Insights",
        arabic: "Arabic",
        english: "English",
        poweredBy: "Powered by AgriLink AI",
        confidential: "Confidential",
        pageOf: (num, total) => `Page ${num} of ${total}`,
      };

  const reportDate = isArabic
    ? `${monthNamesArabic[reportMetadata.month - 1]} ${reportMetadata.year}`
    : `${monthNamesLong[reportMetadata.month - 1]} ${reportMetadata.year}`;

  const generatedDate = new Date().toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const textAlign = isArabic ? "right" : "left";
  const flexDirection = isArabic ? "row-reverse" : "row";
  const fontFamily = isArabic ? "Cairo" : "Inter";

  return React.createElement(
    Document,
    {
      title: translations.title,
      author: "AgriLink AI",
      subject: `AI Business Report - ${reportDate}`,
      keywords: "AI, Business, Report, Analysis, AgriLink",
    },
    React.createElement(
      Page,
      { size: "A4", style: { ...styles.page, fontFamily } },
      [
        // Enhanced Header
        React.createElement(View, { key: "header", style: { ...styles.header, flexDirection } }, [
          React.createElement(View, { key: "logo", style: styles.logoContainer }, [
            React.createElement(LogoIcon, { key: "logo-icon", isArabic }),
          ]),
          React.createElement(View, { key: "header-text", style: styles.headerTextContainer }, [
            React.createElement(
              Text,
              { key: "title", style: { ...styles.title, textAlign } },
              translations.title
            ),
            React.createElement(
              Text,
              { key: "subtitle", style: { ...styles.subtitle, textAlign } },
              translations.subtitle
            ),
          ]),
        ]),

        // Enhanced Metadata
        React.createElement(View, { key: "metadata", style: styles.metadata }, [
          React.createElement(
            View,
            {
              key: "row1",
              style: {
                flexDirection: isArabic ? "row-reverse" : "row",
                justifyContent: "space-between",
                marginBottom: 10,
              },
            },
            [
              React.createElement(View, { key: "period", style: { flex: 1 } }, [
                React.createElement(
                  Text,
                  { key: "label", style: { ...styles.metadataLabel, textAlign } },
                  translations.reportPeriod.toUpperCase()
                ),
                React.createElement(
                  Text,
                  { key: "value", style: { ...styles.metadataValue, textAlign } },
                  reportDate
                ),
              ]),
              React.createElement(View, { key: "generated", style: { flex: 1 } }, [
                React.createElement(
                  Text,
                  { key: "label", style: { ...styles.metadataLabel, textAlign } },
                  translations.generated.toUpperCase()
                ),
                React.createElement(
                  Text,
                  { key: "value", style: { ...styles.metadataValue, textAlign } },
                  generatedDate
                ),
              ]),
            ]
          ),
          React.createElement(
            View,
            {
              key: "row2",
              style: {
                flexDirection: isArabic ? "row-reverse" : "row",
                justifyContent: "space-between",
              },
            },
            [
              React.createElement(View, { key: "language", style: { flex: 1 } }, [
                React.createElement(
                  Text,
                  { key: "label", style: { ...styles.metadataLabel, textAlign } },
                  translations.languageLabel.toUpperCase()
                ),
                React.createElement(
                  Text,
                  { key: "value", style: { ...styles.metadataValue, textAlign } },
                  language === "AR" ? translations.arabic : translations.english
                ),
              ]),
              React.createElement(View, { key: "type", style: { flex: 1 } }, [
                React.createElement(
                  Text,
                  { key: "label", style: { ...styles.metadataLabel, textAlign } },
                  translations.reportType.toUpperCase()
                ),
                React.createElement(
                  Text,
                  { key: "value", style: { ...styles.metadataValue, textAlign } },
                  isDetailed ? translations.detailedAnalysis : translations.summary
                ),
              ]),
            ]
          ),
        ]),

        // Executive Summary
        aiAnalysis.summary &&
          React.createElement(View, { key: "summary", style: styles.section, wrap: false }, [
            React.createElement(
              View,
              {
                key: "header",
                style: {
                  ...styles.sectionHeader,
                  flexDirection: isArabic ? "row-reverse" : "row",
                  alignItems: "center",
                },
              },
              [
                React.createElement(
                  View,
                  {
                    key: "icon-container",
                    style: isArabic ? styles.iconContainerRTL : styles.iconContainer,
                  },
                  [React.createElement(ChartIcon, { key: "icon" })]
                ),
                React.createElement(
                  Text,
                  { key: "text", style: { textAlign } },
                  translations.executiveSummary
                ),
              ]
            ),
            React.createElement(
              Text,
              { key: "text", style: { ...styles.paragraph, textAlign } },
              aiAnalysis.summary
            ),
          ]),

        // Predictions
        aiAnalysis.predictions &&
          aiAnalysis.predictions.length > 0 &&
          React.createElement(View, { key: "predictions", style: styles.section }, [
            React.createElement(
              View,
              {
                key: "header",
                style: {
                  ...styles.sectionHeaderTeal,
                  flexDirection: isArabic ? "row-reverse" : "row",
                  alignItems: "center",
                },
              },
              [
                React.createElement(
                  View,
                  {
                    key: "icon-container",
                    style: isArabic ? styles.iconContainerRTL : styles.iconContainer,
                  },
                  [React.createElement(TrendingIcon, { key: "icon" })]
                ),
                React.createElement(
                  Text,
                  { key: "text", style: { textAlign } },
                  translations.predictions
                ),
              ]
            ),
            ...aiAnalysis.predictions.map((prediction, idx) => {
              const text = typeof prediction === "string" ? prediction : JSON.stringify(prediction);
              const isAlternate = idx % 2 === 1;
              return React.createElement(
                View,
                {
                  key: `pred-${idx}`,
                  style: {
                    ...styles.listItem,
                    ...(isAlternate ? styles.listItemAlternate : {}),
                    flexDirection,
                  },
                },
                [
                  React.createElement(
                    Text,
                    { key: "num", style: styles.listNumber },
                    String(idx + 1)
                  ),
                  React.createElement(
                    Text,
                    { key: "text", style: { ...styles.listText, textAlign } },
                    text
                  ),
                ]
              );
            }),
          ]),

        // Recommendations
        aiAnalysis.suggestions &&
          aiAnalysis.suggestions.length > 0 &&
          React.createElement(View, { key: "recommendations", style: styles.section }, [
            React.createElement(
              View,
              {
                key: "header",
                style: {
                  ...styles.sectionHeader,
                  flexDirection: isArabic ? "row-reverse" : "row",
                  alignItems: "center",
                },
              },
              [
                React.createElement(
                  View,
                  {
                    key: "icon-container",
                    style: isArabic ? styles.iconContainerRTL : styles.iconContainer,
                  },
                  [React.createElement(BulbIcon, { key: "icon" })]
                ),
                React.createElement(
                  Text,
                  { key: "text", style: { textAlign } },
                  translations.recommendations
                ),
              ]
            ),
            ...aiAnalysis.suggestions.map((suggestion, idx) => {
              const text = typeof suggestion === "string" ? suggestion : JSON.stringify(suggestion);
              const isAlternate = idx % 2 === 1;
              return React.createElement(
                View,
                {
                  key: `sugg-${idx}`,
                  style: {
                    ...styles.listItem,
                    ...(isAlternate ? styles.listItemAlternate : {}),
                    flexDirection,
                  },
                },
                [
                  React.createElement(View, { key: "bullet", style: styles.listBullet }, [
                    React.createElement(
                      Text,
                      { key: "icon", style: { fontSize: 12, color: "#10b981" } },
                      "💡"
                    ),
                  ]),
                  React.createElement(
                    Text,
                    { key: "text", style: { ...styles.listText, textAlign } },
                    text
                  ),
                ]
              );
            }),
          ]),

        // Key Insights
        aiAnalysis.insights &&
          aiAnalysis.insights.length > 0 &&
          React.createElement(View, { key: "insights", style: styles.section }, [
            React.createElement(
              View,
              {
                key: "header",
                style: {
                  ...styles.sectionHeaderTeal,
                  flexDirection: isArabic ? "row-reverse" : "row",
                  alignItems: "center",
                },
              },
              [
                React.createElement(
                  View,
                  {
                    key: "icon-container",
                    style: isArabic ? styles.iconContainerRTL : styles.iconContainer,
                  },
                  [React.createElement(SparkleIcon, { key: "icon" })]
                ),
                React.createElement(
                  Text,
                  { key: "text", style: { textAlign } },
                  translations.keyInsights
                ),
              ]
            ),
            ...aiAnalysis.insights.map((insight, idx) => {
              const text = typeof insight === "string" ? insight : JSON.stringify(insight);
              const isAlternate = idx % 2 === 1;
              return React.createElement(
                View,
                {
                  key: `insight-${idx}`,
                  style: {
                    ...styles.listItem,
                    ...(isAlternate ? styles.listItemAlternate : {}),
                    flexDirection,
                  },
                },
                [
                  React.createElement(View, { key: "bullet", style: styles.listBullet }, [
                    React.createElement(
                      Text,
                      { key: "icon", style: { fontSize: 12, color: "#14b8a6" } },
                      "✨"
                    ),
                  ]),
                  React.createElement(
                    Text,
                    { key: "text", style: { ...styles.listText, textAlign } },
                    text
                  ),
                ]
              );
            }),
          ]),

        // Enhanced Footer
        React.createElement(
          View,
          {
            key: "footer",
            style: styles.footer,
            fixed: true,
          },
          [
            React.createElement(
              View,
              { key: "content", style: { ...styles.footerContent, flexDirection } },
              [
                React.createElement(
                  Text,
                  { key: "brand", style: { ...styles.footerBrand, textAlign } },
                  translations.poweredBy
                ),
                React.createElement(Text, {
                  key: "page",
                  style: styles.pageNumber,
                  render: ({ pageNumber, totalPages }) =>
                    translations.pageOf(pageNumber, totalPages),
                }),
              ]
            ),
          ]
        ),
      ].filter(Boolean)
    )
  );
};

/**
 * Generates and downloads a PDF from AI analysis data
 * @param {Object} aiAnalysis - The AI analysis data
 * @param {Object} reportMetadata - Report metadata (month, year, farmName, etc.)
 * @param {boolean} isDetailed - Whether this is a detailed report
 * @param {string} language - Report language (EN/AR)
 */
export const generateAIReportPDF = async (
  aiAnalysis,
  reportMetadata,
  isDetailed = false,
  language = "EN"
) => {
  const monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Generate filename
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `AgriLink_AI_Report_${isDetailed ? "Detailed" : "Summary"}_${monthNamesShort[reportMetadata.month - 1]}_${reportMetadata.year}_${language}_${timestamp}.pdf`;

  // Generate PDF using plain JS function call
  const doc = createAIReportDocument(aiAnalysis, reportMetadata, isDetailed, language);
  const blob = await pdf(doc).toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);
};
