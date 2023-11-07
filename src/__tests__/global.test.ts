import ValidatorTypes from "../enums/validator-types";
import FieldTypes from "../enums/field-types";
import ValidationError from "../lib/ValidationError";
import {
  generateRandomString,
  mockAdapter,
  mockModel,
} from "../lib/test-utils";
import DataModel from "../models/DataModel";

describe("Global tests", () => {
  it("should not be able to create datamodel with invalid fields", async () => {
    const slug = generateRandomString();
    const adapter = mockAdapter();

    const model = DataModel.withAdapter(adapter);

    await expect(
      model.validate([new model({ slug, fields: "toto" })])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([
        new model({
          slug,
          fields: {
            field1: "toto",
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([
        new model({
          slug,
          fields: {
            field1: {
              type: {},
            },
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([
        new model({
          slug,
          fields: {
            field1: {
              type: "invalid",
            },
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);
  });

  it("should not be able to create datamodel with invalid validators", async () => {
    const slug = generateRandomString();
    const adapter = mockAdapter();

    const model = DataModel.withAdapter(adapter);

    await expect(
      model.validate([new model({ slug, validators: "toto" })])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([new model({ slug, validators: {} })])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([new model({ slug, validators: ["required"] })])
    ).rejects.toThrow(ValidationError);

    await expect(
      model.validate([
        new model({
          slug,
          validators: [
            {
              type: "invalid",
            },
          ],
        }),
      ])
    ).rejects.toThrow(ValidationError);
  });

  it("should be able to validate complex documents", async () => {
    const slug = generateRandomString();
    const adapter = mockAdapter();

    const model = DataModel.withAdapter(adapter);

    await expect(
      model.validate([
        new model({
          slug,
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {},
            },
            relSingle: {
              type: FieldTypes.RELATION,
              options: {
                ref: "ref",
              },
            },
            relMultiple: {
              type: FieldTypes.ARRAY,
              options: {
                items: {
                  type: FieldTypes.RELATION,
                  options: {
                    ref: "ref",
                  },
                },
              },
            },
            obj: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  relSingle: {
                    type: FieldTypes.RELATION,
                    options: {
                      ref: "ref",
                    },
                  },
                  relMultiple: {
                    type: FieldTypes.ARRAY,
                    options: {
                      items: {
                        type: FieldTypes.RELATION,
                        options: {
                          ref: "ref",
                        },
                      },
                    },
                  },
                },
              },
            },
            objArr: {
              type: FieldTypes.ARRAY,
              options: {
                items: {
                  type: FieldTypes.NESTED,
                  options: {
                    fields: {
                      relSingle: {
                        type: FieldTypes.RELATION,
                        options: {
                          ref: "ref",
                        },
                      },
                      relMultiple: {
                        type: FieldTypes.ARRAY,
                        options: {
                          items: {
                            type: FieldTypes.RELATION,
                            options: {
                              ref: "ref",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ])
    ).resolves.toBeTruthy();
  });

  it("should be able to validate with nested field with defaultField with multiple documents with different fields", async () => {
    const adapter = mockAdapter();
    const model = mockModel({
      fields: {
        obj: {
          type: FieldTypes.NESTED,
          options: {
            defaultField: {
              type: FieldTypes.NESTED,
              options: {
                fields: {
                  title: {
                    type: FieldTypes.TEXT,
                    options: {},
                  },
                },
                validators: [
                  {
                    type: ValidatorTypes.REQUIRED,
                    options: {
                      field: "title",
                    },
                  },
                ],
              },
            },
          },
        },
      },
    }).withAdapter(adapter);

    await expect(
      model.validate([
        new model({
          obj: {
            a: { title: "test" },
          },
        }),
        new model({
          obj: {
            b: { title: "test" },
          },
        }),
      ])
    ).resolves.toBeTruthy();

    await expect(
      model.validate([
        new model({
          obj: {
            a: { title: "test" },
          },
        }),
        new model({
          obj: {
            b: { noTitle: true },
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);
  });

  it("should be able to validate with nested field in array with multiple documents with different fields", async () => {
    const adapter = mockAdapter();
    const model = mockModel({
      fields: {
        obj: {
          type: FieldTypes.NESTED,
          options: {
            fields: {
              arr: {
                type: FieldTypes.ARRAY,
                options: {
                  items: {
                    type: FieldTypes.NESTED,
                    options: {
                      fields: {
                        title: {
                          type: FieldTypes.TEXT,
                          options: {},
                        },
                      },
                      validators: [
                        {
                          type: ValidatorTypes.REQUIRED,
                          options: {
                            field: "title",
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    }).withAdapter(adapter);

    await expect(
      model.validate([
        new model({
          obj: {
            arr: [{ title: "1" }, { title: "2" }],
          },
        }),
        new model({
          obj: {
            arr: [{ title: "3" }, { title: "4" }],
          },
        }),
      ])
    ).resolves.toBeTruthy();

    await expect(
      model.validate([
        new model({
          obj: {
            arr: [{ title: "1" }, { noTitle: true }],
          },
        }),
        new model({
          obj: {
            arr: [{ title: "3" }, { title: "4" }],
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);
  });

  it("should be able to validate with nested field in array with defaultField with multiple documents with different fields", async () => {
    const adapter = mockAdapter();
    const model = mockModel({
      fields: {
        obj: {
          type: FieldTypes.NESTED,
          options: {
            fields: {
              arr: {
                type: FieldTypes.ARRAY,
                options: {
                  items: {
                    type: FieldTypes.NESTED,
                    options: {
                      defaultField: {
                        type: FieldTypes.NESTED,
                        options: {
                          fields: {
                            nestedArr: {
                              type: FieldTypes.ARRAY,
                              options: {
                                items: {
                                  type: FieldTypes.NESTED,
                                  options: {
                                    defaultField: {
                                      type: FieldTypes.NESTED,
                                      options: {
                                        fields: {
                                          title: {
                                            type: FieldTypes.TEXT,
                                            options: {},
                                          },
                                        },
                                        validators: [
                                          {
                                            type: ValidatorTypes.REQUIRED,
                                            options: {
                                              field: "title",
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }).withAdapter(adapter);

    await expect(
      model.validate([
        new model({
          obj: {
            arr: [
              {
                a: {
                  nestedArr: [{ a0: { title: "1" } }, { a1: { title: "2" } }],
                },
                b: {
                  nestedArr: [{ b0: { title: "3" } }, { b1: { title: "4" } }],
                },
              },
              {
                b: {
                  nestedArr: [{ b0: { title: "1" } }, { b1: { title: "2" } }],
                },
                c: {
                  nestedArr: [{ c0: { title: "3" } }, { c1: { title: "4" } }],
                },
              },
              {
                c: {
                  nestedArr: [{ c0: { title: "1" } }, { c1: { title: "2" } }],
                },
                d: {
                  nestedArr: [{ d0: { title: "3" } }, { d1: { title: "4" } }],
                },
              },
            ],
          },
        }),
        new model({
          obj: {
            arr: [
              {
                a: {
                  nestedArr: [{ a0: { title: "1" } }, { a1: { title: "2" } }],
                },
                b: {
                  nestedArr: [{ b0: { title: "3" } }, { b1: { title: "4" } }],
                },
              },
              {
                b: {
                  nestedArr: [{ b0: { title: "1" } }, { b1: { title: "2" } }],
                },
                c: {
                  nestedArr: [{ c0: { title: "3" } }, { c1: { title: "4" } }],
                },
              },
              {
                c: {
                  nestedArr: [{ c0: { title: "1" } }, { c1: { title: "2" } }],
                },
                d: {
                  nestedArr: [{ d0: { title: "3" } }, { d1: { title: "4" } }],
                },
              },
            ],
          },
        }),
      ])
    ).resolves.toBeTruthy();

    await expect(
      model.validate([
        new model({
          obj: {
            arr: [
              {
                a: {
                  nestedArr: [{ a0: { title: "1" } }, { a1: { title: "2" } }],
                },
                b: {
                  nestedArr: [
                    { b0: { title: "3" } },
                    { b1: { noTitle: true } },
                  ],
                },
              },
              {
                b: {
                  nestedArr: [{ b0: { title: "1" } }, { b1: { title: "2" } }],
                },
                c: {
                  nestedArr: [{ c0: { title: "3" } }, { c1: { title: "4" } }],
                },
              },
              {
                c: {
                  nestedArr: [{ c0: { title: "1" } }, { c1: { title: "2" } }],
                },
                d: {
                  nestedArr: [{ d0: { title: "3" } }, { d1: { title: "4" } }],
                },
              },
            ],
          },
        }),
        new model({
          obj: {
            arr: [
              {
                a: {
                  nestedArr: [{ a0: { title: "1" } }, { a1: { title: "2" } }],
                },
                b: {
                  nestedArr: [{ b0: { title: "3" } }, { b1: { title: "4" } }],
                },
              },
              {
                b: {
                  nestedArr: [{ b0: { title: "1" } }, { b1: { title: "2" } }],
                },
                c: {
                  nestedArr: [{ c0: { title: "3" } }, { c1: { title: "4" } }],
                },
              },
              {
                c: {
                  nestedArr: [{ c0: { title: "1" } }, { c1: { title: "2" } }],
                },
                d: {
                  nestedArr: [{ d0: { title: "3" } }, { d1: { title: "4" } }],
                },
              },
            ],
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);
  });

  it("should detect unique fields on nested field in array with multiple documents", async () => {
    const adapter = mockAdapter();
    const model = mockModel({
      fields: {
        obj: {
          type: FieldTypes.NESTED,
          options: {
            fields: {
              arr: {
                type: FieldTypes.ARRAY,
                options: {
                  items: {
                    type: FieldTypes.NESTED,
                    options: {
                      defaultField: {
                        type: FieldTypes.NESTED,
                        options: {
                          fields: {
                            nestedArr: {
                              type: FieldTypes.ARRAY,
                              options: {
                                items: {
                                  type: FieldTypes.NESTED,
                                  options: {
                                    fields: {
                                      label: {
                                        type: FieldTypes.TEXT,
                                        options: {},
                                      },
                                    },
                                    validators: [
                                      {
                                        type: ValidatorTypes.UNIQUE,
                                        options: {
                                          field: "label",
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }).withAdapter(adapter);

    await expect(
      model.validate([
        new model({
          obj: {
            arr: [
              {
                a: {
                  nestedArr: [{ label: "1" }, { label: "2" }],
                },
                b: {
                  nestedArr: [{ label: "3" }, { label: "4" }],
                },
              },
            ],
          },
        }),
        new model({
          obj: {
            arr: [
              {
                a: {
                  nestedArr: [{ label: "5" }, { label: "6" }],
                },
                b: {
                  nestedArr: [{ label: "3" }, { label: "4" }],
                },
              },
            ],
          },
        }),
      ])
    ).rejects.toThrow(ValidationError);
  });

  // TODO: fix this test
  // it("should detect unique fields on nested field in array with multiple documents and different values in nested array", async () => {
  //   const adapter = mockAdapter();
  //   const model = mockModel({
  //     fields: {
  //       obj: {
  //         type: FieldTypes.NESTED,
  //         options: {
  //           fields: {
  //             arr: {
  //               type: FieldTypes.ARRAY,
  //               options: {
  //                 items: {
  //                   type: FieldTypes.NESTED,
  //                   options: {
  //                     defaultField: {
  //                       type: FieldTypes.NESTED,
  //                       options: {
  //                         fields: {
  //                           nestedArr: {
  //                             type: FieldTypes.ARRAY,
  //                             options: {
  //                               items: {
  //                                 type: FieldTypes.NESTED,
  //                                 options: {
  //                                   fields: {
  //                                     label: {
  //                                       type: FieldTypes.TEXT,
  //                                       options: {},
  //                                     },
  //                                   },
  //                                   validators: [
  //                                     {
  //                                       type: ValidatorTypes.UNIQUE,
  //                                       options: {
  //                                         field: "label",
  //                                       },
  //                                     },
  //                                   ],
  //                                 },
  //                               },
  //                             },
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   }).withAdapter(adapter);

  //   await expect(
  //     model.validate([
  //       new model({
  //         obj: {
  //           arr: [
  //             {
  //               a: {
  //                 nestedArr: [{ label: "1" }, { label: "2" }],
  //               },
  //               b: {
  //                 nestedArr: [{ label: "3" }, { label: "4" }],
  //               },
  //             },
  //           ],
  //         },
  //       }),
  //       new model({
  //         obj: {
  //           arr: [
  //             {
  //               a: {
  //                 nestedArr: [{ label: "5" }, { label: "6" }],
  //               },
  //               b: {
  //                 nestedArr: [{ label: "7" }, { label: "4" }],
  //               },
  //             },
  //           ],
  //         },
  //       }),
  //     ])
  //   ).rejects.toThrow(ValidationError);
  // });

  it("should be able to create multiple datamodels at once", async () => {
    const adapter = mockAdapter();

    await expect(
      DataModel.withAdapter(adapter).validate([
        {
          slug: generateRandomString(),
          keyField: "title",
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {},
            },
            subtitle: {
              type: FieldTypes.TEXT,
              options: {},
            },
          },
        },
        {
          slug: generateRandomString(),
        },
      ])
    ).resolves.toBeTruthy();

    await expect(
      DataModel.withAdapter(adapter).validate([
        {
          slug: generateRandomString(),
          keyField: "title",
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {},
            },
          },
          validators: [
            {
              type: "required",
              options: { field: "title" },
            },
          ],
        },
        {
          slug: generateRandomString(),
          fields: {},
        },
      ])
    ).resolves.toBeTruthy();

    await expect(
      DataModel.withAdapter(adapter).validate([
        {
          slug: generateRandomString(),
          keyField: "title",
          fields: {
            title: {
              type: FieldTypes.TEXT,
              options: {},
            },
          },
          validators: [
            {
              type: "required",
              options: { field: "title" },
            },
          ],
        },
        {
          slug: generateRandomString(),
          fields: {},
          validators: [],
        },
      ])
    ).resolves.toBeTruthy();
  });
});
