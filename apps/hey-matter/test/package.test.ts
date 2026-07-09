import backend from "@hey-matter/backend/package.json" with { type: "json" };
import common from "@hey-matter/common/package.json" with { type: "json" };
import { mapValues, pickBy } from "lodash-es";
import { describe, expect, it } from "vitest";
import own from "../package.json" with { type: "json" };

describe("hey-matter", () => {
  it("should include all necessary dependencies", () => {
    const expected = pickBy(
      { ...backend.dependencies, ...common.dependencies },
      (_, key) => !key.startsWith("@hey-matter/"),
    );
    expect(own.dependencies).toEqual(expected);
  });

  it("should pin all dependencies", () => {
    const expected = mapValues(own.dependencies, (value) =>
      value.replace(/^\D+/, ""),
    );
    expect(own.dependencies).toEqual(expected);
  });
});
