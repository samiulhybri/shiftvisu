import { MPCostSubGroup } from "src/app/enums/mp-cost-sub-group";

export class PanelBarData {
  public static data = [
    {
      id: 1,
      title: $localize`Tool`,
      hasSubtitle: false,
      isSelected: false,
      isExpanded: false,
      content: "root_item",
      cstGrp: "root_item",
      cstSubGrp: "root_item",
    },
    {
      id: 2,
      title: $localize`Raw Material`,
      hasSubtitle: true,
      isSelected: false,
      isExpanded: false,
      content: "material_cost",
      cstGrp: "MATERIAL",
      cstSubGrp: MPCostSubGroup.MATERIAL_INTERNAL,
      total:0
    },
    {
      id: 3,
      title: $localize`Material Acquired`,
      hasSubtitle: true,
      isSelected: false,
      isExpanded: false,
      content: "raw_material",
      cstGrp: "MATERIAL",
      cstSubGrp: MPCostSubGroup.MATERIAL_ACQUIRED,
      total:0
    },
    {
      id: 4,
      title: $localize`External Costs`,
      hasSubtitle: true,
      isSelected: false,
      isExpanded: false,
      content: "external_costs",
      cstGrp: "EXTERNAL",
      cstSubGrp: MPCostSubGroup.EXTERNAL,
      total:0
    },
    {
      id: 5,
      title: $localize`Technical Office`,
      hasSubtitle: true,
      isSelected: false,
      isExpanded: false,
      content: "technical_office",
      cstGrp: "INTERNAL",
      cstSubGrp: MPCostSubGroup.INTERNAL_TECH_OFFICE,
      total:0
    },
    {
      id: 6,
      title: $localize`Machining`,
      hasSubtitle: true,
      isSelected: false,
      isExpanded: false,
      content: "machining",
      cstGrp: "INTERNAL",
      cstSubGrp: MPCostSubGroup.INTERNAL_MACHINING,
      total:0
    },
    {
      id: 7,
      title: $localize`Erosion`,
      hasSubtitle: true,
      isSelected: false,
      isExpanded: false,
      content: "erosion",
      cstGrp: "INTERNAL",
      cstSubGrp: MPCostSubGroup.INTERNAL_EROSION,
      total:0
    },
    {
      id: 8,
      title: $localize`Assembly`,
      hasSubtitle: true,
      isSelected: false,
      isExpanded: false,
      content: "assembly",
      cstGrp: "INTERNAL",
      cstSubGrp: MPCostSubGroup.INTERNAL_ASSEMBLY,
      total:0
    },
    {
      id: 9,
      title: $localize`Sampling`,
      hasSubtitle: true,
      isSelected: false,
      isExpanded: false,
      content: "sampling",
      cstGrp: "INTERNAL",
      cstSubGrp: MPCostSubGroup.INTERNAL_SAMPLING,
      total:0
    },
    {
      id:10,
      title: $localize`Quality Control`,
      hasSubtitle: true,
      isSelected: false,
      isExpanded: false,
      content: "quality_control",
      cstGrp: "INTERNAL",
      cstSubGrp: MPCostSubGroup.INTERNAL_QUALITY,
      total:0
    },
    {
      id: 11,
      title: $localize`Notes`,
      hasSubtitle: false,
      isSelected: false,
      isExpanded: false,
      content: "notes",
      cstGrp: "notes",
      cstSubGrp: "notes",
      total:0
    },
  ];

  public static initializeTotal(posData:any){
    this.data.forEach(category => {
      category.total = 0;
      for(var i = 0; i < posData.length; i++){
        if(category.cstGrp == posData[i].cost_group && category.cstSubGrp == posData[i].cost_sub_group){
          category.total += posData[i].total;
        }
      }
    });
  }
}
