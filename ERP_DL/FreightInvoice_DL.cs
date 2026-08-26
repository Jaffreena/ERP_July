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
    // NEW FILE - mirrors JW_Invoice_DL.cs (JobworkInvoiceSummaryList / JobworkInvoiceDetailList)
    // Add this file next to JW_Invoice_DL.cs in the ERP_DL project.
    public class FreightInvoice_DL
    {
        public List<FreightInvoiceSummary_DTO> FreightInvoiceSummaryList(DataTable Dt)
        {
            List<FreightInvoiceSummary_DTO> InvoiceList =
                new List<FreightInvoiceSummary_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                InvoiceList.Add(
                    new FreightInvoiceSummary_DTO
                    {
                        FRTIH_Number =
                            Convert.ToInt64(dr["FRTIH_Number"]),

                        FRTIH_InvoiceNo =
                            Convert.ToString(dr["FRTIH_InvoiceNo"]),

                        FRTIH_InvoiceDate =
                            Convert.ToString(dr["FRTIH_InvoiceDate"]),

                        CUS_Name =
                            Convert.ToString(dr["CUS_Name"]),

                        CustomerGroup =
                            Convert.ToString(dr["CustomerGroup"]),

                        CustomerCategory =
                            Convert.ToString(dr["CustomerCategory"]),

                        CurrencyCode =
                            Convert.ToString(dr["CurrencyCode"]),

                        TaxCluster =
                            Convert.ToString(dr["TaxCluster"]),

                        TotalQty = Convert.ToDecimal(
                            dr["TotalQty"] == DBNull.Value ? 0 : dr["TotalQty"]),

                        Amount = Convert.ToDecimal(
                            dr["Amount"] == DBNull.Value ? 0 : dr["Amount"]),

                        GST_Amount = Convert.ToDecimal(
                            dr["GST_Amount"] == DBNull.Value ? 0 : dr["GST_Amount"]),

                        Segregation =
                            Convert.ToString(dr["Segregation"]),

                        WarehouseCode =
                            Convert.ToString(dr["WarehouseCode"]),

                        DN_Count =
                            Convert.ToString(dr["DN_Count"]),

                        DN_List =
                            Convert.ToString(dr["DN_List"]),

                        SO_List =
                            dr.Table.Columns.Contains("SO_List")
                                ? Convert.ToString(dr["SO_List"])
                                : "",
                    });
            }

            return InvoiceList;
        }

        public List<FreightInvoiceDetail_DTO> FreightInvoiceDetailList(DataTable Dt)
        {
            List<FreightInvoiceDetail_DTO> InvoiceList =
                new List<FreightInvoiceDetail_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                InvoiceList.Add(
                    new FreightInvoiceDetail_DTO
                    {
                        JIDNH_MS_Number =
                            dr["JIDNH_MS_Number"] == DBNull.Value
                                ? 0
                                : Convert.ToInt64(dr["JIDNH_MS_Number"]),

                        JIDNH_WH_Number =
                            dr["JIDNH_WH_Number"] == DBNull.Value
                                ? 0
                                : Convert.ToInt64(dr["JIDNH_WH_Number"]),

                        FRTIH_Number =
                            dr["FRTIH_Number"] == DBNull.Value
                                ? 0
                                : Convert.ToInt64(dr["FRTIH_Number"]),

                        FRTIH_InvoiceNo =
                            dr["FRTIH_InvoiceNo"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["FRTIH_InvoiceNo"]),

                        FRTIH_InvoiceDate =
                            dr["FRTIH_InvoiceDate"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["FRTIH_InvoiceDate"]),

                        JIDNH_DN_No =
                            dr["JIDNH_DN_No"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["JIDNH_DN_No"]),

                        JIDNH_DN_Date =
                            dr["JIDNH_DN_Date"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["JIDNH_DN_Date"]),

                        CUS_Name =
                            dr["CUS_Name"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["CUS_Name"]),

                        CustomerGroup =
                            dr["CustomerGroup"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["CustomerGroup"]),

                        CustomerCategory =
                            dr["CustomerCategory"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["CustomerCategory"]),

                        CurrencyCode =
                            dr["CurrencyCode"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["CurrencyCode"]),

                        TaxCluster =
                            dr["TaxCluster"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["TaxCluster"]),

                        FRTII_Qty =
                            dr["FRTII_Qty"] == DBNull.Value
                                ? 0
                                : Convert.ToDecimal(dr["FRTII_Qty"]),

                        FRTII_Amount =
                            dr["FRTII_Amount"] == DBNull.Value
                                ? 0
                                : Convert.ToDecimal(dr["FRTII_Amount"]),

                        FRTII_GST_Amount =
                            dr["FRTII_GST_Amount"] == DBNull.Value
                                ? 0
                                : Convert.ToDecimal(dr["FRTII_GST_Amount"]),

                        Segregation =
                            dr["Segregation"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["Segregation"]),

                        WarehouseCode =
                            dr["WarehouseCode"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["WarehouseCode"]),

                        PRS_ProcessName =
                            dr["PRS_ProcessName"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["PRS_ProcessName"]),

                        ItemGroup =
                            dr["ItemGroup"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["ItemGroup"]),

                        ItemCode =
                            dr["ItemCode"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["ItemCode"]),

                        ItemDescription =
                            dr["ItemDescription"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["ItemDescription"]),

                        OuterDia =
                            dr["OuterDia"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["OuterDia"]),

                        Thickness =
                            dr["Thickness"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["Thickness"]),

                        Length =
                            dr["Length"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["Length"]),

                        ITM_Width =
                            dr["ITM_Width"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["ITM_Width"]),

                        MaterialGrade =
                            dr["MaterialGrade"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["MaterialGrade"]),

                        UOM =
                            dr["UOM"] == DBNull.Value
                                ? ""
                                : Convert.ToString(dr["UOM"]),

                        ServiceOrderNo =
                            dr.Table.Columns.Contains("JISVOH_ServiceOrderNo") &&
                            dr["JISVOH_ServiceOrderNo"] != DBNull.Value
                                ? Convert.ToString(dr["JISVOH_ServiceOrderNo"])
                                : ""
                    });
            }

            return InvoiceList;
        }
    }
}
