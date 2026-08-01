--- a/src/components/ContributorMap/common.ts
+++ b/src/components/ContributorMap/common.ts
@@ -10,7 +10,7 @@
 export const DISCIPLINE_COLOR: Record<string, string> = {};
 for (const category of disciplines.categories) {
-  for (co
+  for (const discipline of category.disciplines) {
     DISCIPLINE_COLOR[discipline.name] = category.accentColor;
   }
 }
