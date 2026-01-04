import { access, stat } from "node:fs/promises";
import path from "node:path";

export type ProjectType = "java" | "python" | "unknown";

const JAVA_MARKERS = [
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "settings.gradle",
  "settings.gradle.kts",
  "mvnw",
  "gradlew",
];

const PYTHON_MARKERS = [
  "pyproject.toml",
  "requirements.txt",
  "setup.py",
  "setup.cfg",
  "Pipfile",
  "Pipfile.lock",
];

const pathExists = async (targetPath: string): Promise<boolean> => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const directoryExists = async (targetPath: string): Promise<boolean> => {
  try {
    const stats = await stat(targetPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
};

const anyPathExists = async (rootDir: string, markers: string[]): Promise<boolean> => {
  for (const marker of markers) {
    if (await pathExists(path.join(rootDir, marker))) {
      return true;
    }
  }
  return false;
};

export const detectProjectType = async (rootDir: string): Promise<ProjectType> => {
  const hasJavaMarker = await anyPathExists(rootDir, JAVA_MARKERS);
  const hasJavaSource = await directoryExists(path.join(rootDir, "src", "main", "java"));
  if (hasJavaMarker || hasJavaSource) {
    return "java";
  }

  const hasPythonMarker = await anyPathExists(rootDir, PYTHON_MARKERS);
  if (hasPythonMarker) {
    return "python";
  }

  return "unknown";
};
