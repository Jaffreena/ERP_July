using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class Conversion_DL
    {
        MethodHelp MH = new MethodHelp();
        public List<ConversionSummary_DTO> ConversionSummaryList(DataTable Dt)
        {
            List<ConversionSummary_DTO> ConversionList =
                new List<ConversionSummary_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                ConversionList.Add(
                    new ConversionSummary_DTO
                    {
                        // ================= HEADER =================
                        JICNVH_ConvJournalNo =
                            Convert.ToString(dr["JICNVH_ConvJournalNo"]),

                        JICNVH_Number =
                            dr["JICNVH_Number"] == DBNull.Value
                            ? 0
                            : Convert.ToInt64(dr["JICNVH_Number"]),

                        JICNVH_Date =
                            Convert.ToString(dr["JICNVH_Date"]),

                        JICNVH_SFT_Number =
                            dr["JICNVH_SFT_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVH_SFT_Number"]),

                        JICNVH_WC_Number =
                            dr["JICNVH_WC_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVH_WC_Number"]),

                        JICNVH_PRS_Number =
                            dr["JICNVH_PRS_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVH_PRS_Number"]),

                        SFT_ShiftName =
                            Convert.ToString(dr["SFT_ShiftName"]),

                        WC_WorkCentre =
                            Convert.ToString(dr["WC_WorkCentre"]),

                        PRS_ProcessName =
                            Convert.ToString(dr["PRS_ProcessName"]),

                        // ================= CONSUMPTION =================
                        Cons_NoOfLines =
                            dr["Cons_NoOfLines"] == DBNull.Value
                            ? (int?)null
                            : Convert.ToInt32(dr["Cons_NoOfLines"]),

                   
                        Cons_UOMCode =
                            Convert.ToString(dr["Cons_UOMCode"]),

                        Cons_Qty =
                            dr["Cons_Qty"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Cons_Qty"]),

                        Cons_WHCode =
                            Convert.ToString(dr["Cons_WHCode"]),

                        // ================= PRODUCTION =================
                        Prod_NoOfLines =
                            dr["Prod_NoOfLines"] == DBNull.Value
                            ? (int?)null
                            : Convert.ToInt32(dr["Prod_NoOfLines"]),
 

                        Prod_UOMCode =
                            Convert.ToString(dr["Prod_UOMCode"]),

                        Prod_Qty =
                            dr["Prod_Qty"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Prod_Qty"]),

                        Prod_WHCode =
                            Convert.ToString(dr["Prod_WHCode"]),

                        // ================= SCRAP =================
                        Scrap_NoOfLines =
                            dr["Scrap_NoOfLines"] == DBNull.Value
                            ? (int?)null
                            : Convert.ToInt32(dr["Scrap_NoOfLines"]),

                   

                        Scrap_UOMCode =
                            Convert.ToString(dr["Scrap_UOMCode"]),

                        Scrap_Qty =
                            dr["Scrap_Qty"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Scrap_Qty"]),

                        Scrap_WHCode =
                            Convert.ToString(dr["Scrap_WHCode"])
                    });
            }

            return ConversionList;
        }
        public List<ConversionDetailed_DTO> ConversionDetailedList(DataTable Dt)
        {
            List<ConversionDetailed_DTO> ConversionList =
                new List<ConversionDetailed_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                ConversionList.Add(
                    new ConversionDetailed_DTO
                    {
                        // ================= HEADER =================
                        JICNVH_ConvJournalNo =
                            Convert.ToString(dr["JICNVH_ConvJournalNo"]),

                        JICNVH_Number =
                            dr["JICNVH_Number"] == DBNull.Value
                            ? 0
                            : Convert.ToInt64(dr["JICNVH_Number"]),

                        JICNVH_Date =
    dr["JICNVH_Date"] == DBNull.Value
    ? string.Empty
    : Convert.ToDateTime(dr["JICNVH_Date"]).ToString("dd-MMM-yyyy"),

                        JICNVH_SFT_Number =
                            dr["JICNVH_SFT_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVH_SFT_Number"]),

                        JICNVH_WC_Number =
                            dr["JICNVH_WC_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVH_WC_Number"]),

                        JICNVH_PRS_Number =
                            dr["JICNVH_PRS_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVH_PRS_Number"]),

                        SFT_ShiftName =
                            Convert.ToString(dr["SFT_ShiftName"]),

                        WC_WorkCentre =
                            Convert.ToString(dr["WC_WorkCentre"]),

                        PRS_ProcessName =
                            Convert.ToString(dr["PRS_ProcessName"]),

                        // ================= CONSUMPTION =================
                        JICNVC_Number =
                            dr["JICNVC_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVC_Number"]),

                        Cons_Item =
                            dr["Cons_Item"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["Cons_Item"]),

                        Cons_WH =
                            dr["Cons_WH"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["Cons_WH"]),

                        JICNVC_UoM_Number =
                            dr["JICNVC_UoM_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVC_UoM_Number"]),

                        JICNVC_ConsQty =
                            dr["JICNVC_ConsQty"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["JICNVC_ConsQty"]),

                        Cons_ItemCode =
                            Convert.ToString(dr["Cons_ItemCode"]),

                        Cons_ItemDescription =
                            Convert.ToString(dr["Cons_ItemDescription"]),

                        Cons_OuterDia =
                            dr["Cons_OuterDia"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Cons_OuterDia"]),

                        Cons_Thickness =
                            dr["Cons_Thickness"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Cons_Thickness"]),

                        Cons_Length =
                            dr["Cons_Length"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Cons_Length"]),

                        Cons_Width =
                            dr["Cons_Width"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Cons_Width"]),

                        Cons_MaterialGrade =
                            Convert.ToString(dr["Cons_MaterialGrade"]),

                        Cons_UOMCode =
                            Convert.ToString(dr["Cons_UOMCode"]),

                        Cons_UOMDescription =
                            Convert.ToString(dr["Cons_UOMDescription"]),

                        Cons_ItemGroup =
                            Convert.ToString(dr["Cons_ItemGroup"]),

                        Cons_ItemGroupName =
                            Convert.ToString(dr["Cons_ItemGroupName"]),

                        // ================= PRODUCTION =================
                        JICNVP_Number =
                            dr["JICNVP_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVP_Number"]),

                        Prod_Item =
                            dr["Prod_Item"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["Prod_Item"]),

                        Prod_WH =
                            dr["Prod_WH"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["Prod_WH"]),

                        JICNVP_UoM_Number =
                            dr["JICNVP_UoM_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVP_UoM_Number"]),

                        JICNVP_ProdQty =
                            dr["JICNVP_ProdQty"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["JICNVP_ProdQty"]),

                        Prod_ItemCode =
                            Convert.ToString(dr["Prod_ItemCode"]),

                        Prod_ItemDescription =
                            Convert.ToString(dr["Prod_ItemDescription"]),

                        Prod_OuterDia =
                            dr["Prod_OuterDia"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Prod_OuterDia"]),

                        Prod_Thickness =
                            dr["Prod_Thickness"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Prod_Thickness"]),

                        Prod_Length =
                            dr["Prod_Length"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Prod_Length"]),

                        Prod_Width =
                            dr["Prod_Width"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Prod_Width"]),

                        Prod_MaterialGrade =
                            Convert.ToString(dr["Prod_MaterialGrade"]),

                        Prod_UOMCode =
                            Convert.ToString(dr["Prod_UOMCode"]),

                        Prod_UOMDescription =
                            Convert.ToString(dr["Prod_UOMDescription"]),

                        Prod_ItemGroup =
                            Convert.ToString(dr["Prod_ItemGroup"]),

                        Prod_ItemGroupName =
                            Convert.ToString(dr["Prod_ItemGroupName"]),

                        // ================= SCRAP =================
                        JICNVS_Number =
                            dr["JICNVS_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVS_Number"]),

                        Scrap_Item =
                            dr["Scrap_Item"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["Scrap_Item"]),

                        Scrap_WH =
                            dr["Scrap_WH"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["Scrap_WH"]),

                        JICNVS_UoM_Number =
                            dr["JICNVS_UoM_Number"] == DBNull.Value
                            ? (long?)null
                            : Convert.ToInt64(dr["JICNVS_UoM_Number"]),

                        JICNVS_ScrapQty =
                            dr["JICNVS_ScrapQty"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["JICNVS_ScrapQty"]),

                        Scrap_ItemCode =
                            Convert.ToString(dr["Scrap_ItemCode"]),

                        Scrap_ItemDescription =
                            Convert.ToString(dr["Scrap_ItemDescription"]),

                        Scrap_OuterDia =
                            dr["Scrap_OuterDia"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Scrap_OuterDia"]),

                        Scrap_Thickness =
                            dr["Scrap_Thickness"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Scrap_Thickness"]),

                        Scrap_Length =
                            dr["Scrap_Length"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Scrap_Length"]),

                        Scrap_Width =
                            dr["Scrap_Width"] == DBNull.Value
                            ? (decimal?)null
                            : Convert.ToDecimal(dr["Scrap_Width"]),

                        Scrap_MaterialGrade =
                            Convert.ToString(dr["Scrap_MaterialGrade"]),

                        Scrap_UOMCode =
                            Convert.ToString(dr["Scrap_UOMCode"]),

                        Scrap_UOMDescription =
                            Convert.ToString(dr["Scrap_UOMDescription"]),

                        Scrap_ItemGroup =
                            Convert.ToString(dr["Scrap_ItemGroup"]),

                        Scrap_ItemGroupName =
                            Convert.ToString(dr["Scrap_ItemGroupName"]),
                        Cons_WHCode =
                            Convert.ToString(dr["Cons_WHCode"]),
                        Prod_WHCode =
                            Convert.ToString(dr["Prod_WHCode"]),
                        Scrap_WHCode =
                            Convert.ToString(dr["Scrap_WHCode"])
                    });
            }

            return ConversionList;
        }
    }
}
