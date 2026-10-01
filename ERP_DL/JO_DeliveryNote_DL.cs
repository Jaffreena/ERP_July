using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace ERP_DL
{
    public class JO_DeliveryNote_DL
    {
        MethodHelp MH = new MethodHelp();

        //-----------------------------------------
        // VENDOR SEARCH LIST   (JO_DeliveryNote_SP Id 5)
        //-----------------------------------------
        public List<JO_DNVendor_DTO> VendorList(DataTable Dt)
        {
            List<JO_DNVendor_DTO> list = new List<JO_DNVendor_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JO_DNVendor_DTO
                {
                    JWV_WH_Number = dr["JWV_WH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JWV_WH_Number"]),
                    JWV_Number = dr["JWV_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JWV_Number"]),
                    JWV_JW_VendorName = Convert.ToString(dr["JWV_JW_VendorName"]),
                    JWV_Currency_Number = dr["JWV_Currency_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JWV_Currency_Number"]),
                    CurrencyCode = Convert.ToString(dr["CurrencyCode"]),
                    JWV_CUR_Name = Convert.ToString(dr["JWV_CUR_Name"]),
                    JWV_CUR_DecimalPlaces = dr["JWV_CUR_DecimalPlaces"] == DBNull.Value ? 0 : Convert.ToInt32(dr["JWV_CUR_DecimalPlaces"]),
                    JWV_WHT_Number = dr["JWV_WHT_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JWV_WHT_Number"]),
                    JWV_TCT_Number = dr["JWV_TCT_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JWV_TCT_Number"])
                });
            }

            return list;
        }

        //-----------------------------------------
        // VENDOR ADDRESS   (JO_DeliveryNote_SP Id 13 / 14 and Address Edit)
        //-----------------------------------------
        public List<JO_DNVendorAddress_DTO> VendorAddress(DataTable Dt)
        {
            List<JO_DNVendorAddress_DTO> list = new List<JO_DNVendorAddress_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JO_DNVendorAddress_DTO
                {
                    JWV_ADD_Number = Convert.ToInt64(dr["JWV_ADD_Number"]),
                    JWV_ADD_ADTP_Number = Convert.ToInt64(dr["JWV_ADD_ADTP_Number"]),
                    JWV_ADD_Address_ID = Convert.ToString(dr["JWV_ADD_Address_ID"]),
                    JWV_ADD_Address = Convert.ToString(dr["JWV_ADD_Address"]),
                    JWV_ADD_City = Convert.ToString(dr["JWV_ADD_City"]),
                    JWV_ADD_State = Convert.ToString(dr["JWV_ADD_State"]),
                    JWV_ADD_Country = Convert.ToString(dr["JWV_ADD_Country"]),
                    JWV_ADD_PIN = Convert.ToString(dr["JWV_ADD_PIN"]),
                    JWV_ADD_GSTIN = Convert.ToString(dr["JWV_ADD_GSTIN"])
                });
            }

            return list;
        }

        public List<JO_DNVendorAddress_DTO> VendorAddressID(DataTable Dt)
        {
            List<JO_DNVendorAddress_DTO> list = new List<JO_DNVendorAddress_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                list.Add(new JO_DNVendorAddress_DTO
                {
                    JWV_ADD_Number = Convert.ToInt64(dr["JWV_ADD_Number"]),
                    JWV_ADD_Address_ID = Convert.ToString(dr["JWV_ADD_Address_ID"])
                });
            }

            return list;
        }

        //-----------------------------------------
        // SUMMARY
        //-----------------------------------------
        public List<JO_DeliveryNoteSummary_DTO> DNSummaryList(DataTable Dt)
        {
            List<JO_DeliveryNoteSummary_DTO> DNList = new List<JO_DeliveryNoteSummary_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                DNList.Add(
                    new JO_DeliveryNoteSummary_DTO
                    {
                        JODNH_Number =
                            dr["JODNH_Number"] == DBNull.Value ||
                            string.IsNullOrWhiteSpace(dr["JODNH_Number"].ToString())
                            ? 0
                            : Convert.ToInt64(dr["JODNH_Number"]),

                        JODNH_DN_No = Convert.ToString(dr["JODNH_DN_No"]),

                        JODNH_DN_Date =
                            dr["JODNH_DN_Date"] == DBNull.Value
                            ? DateTime.MinValue
                            : Convert.ToDateTime(dr["JODNH_DN_Date"]),

                        JODNH_JW_Vendor_Number =
                            dr["JODNH_JW_Vendor_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JODNH_JW_Vendor_Number"]),

                        JWV_JVG_Number =
                            dr["JWV_JVG_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JWV_JVG_Number"]),

                        JWV_JW_VendorName = Convert.ToString(dr["JWV_JW_VendorName"]),

                        CurrencyCode = Convert.ToString(dr["CurrencyCode"]),

                        WarehouseCode = Convert.ToString(dr["WarehouseCode"]),

                        JODNH_MS_Number =
                            dr["JODNH_MS_Number"] == DBNull.Value ||
                            string.IsNullOrWhiteSpace(dr["JODNH_MS_Number"].ToString())
                            ? 0
                            : Convert.ToInt64(dr["JODNH_MS_Number"]),

                        JODNH_IsFreightApplicable = Convert.ToString(dr["JODNH_IsFreightApplicable"]),

                        Segregation = Convert.ToString(dr["Segregation"]),

                        NoOfLineItems =
                            dr["NoOfLineItems"] == DBNull.Value ||
                            string.IsNullOrWhiteSpace(dr["NoOfLineItems"].ToString())
                            ? 0
                            : Convert.ToInt32(dr["NoOfLineItems"]),

                        Qty =
                            MH.DecimalConvertQty(
                                dr["Qty"] == DBNull.Value ||
                                string.IsNullOrWhiteSpace(dr["Qty"].ToString())
                                ? 0
                                : Convert.ToDouble(dr["Qty"])),

                        Amount =
                            dr["Amount"] == DBNull.Value ||
                            string.IsNullOrWhiteSpace(dr["Amount"].ToString())
                            ? 0
                            : Convert.ToDouble(dr["Amount"]),

                        JVG_JW_VendorGroup = Convert.ToString(dr["JVG_JW_VendorGroup"]),

                        JVC_JW_VendorCategory = Convert.ToString(dr["JVC_JW_VendorCategory"]),

                        VendorWareHouse = Convert.ToString(dr["VendorWareHouse"]),

                        ItemWareHouse = Convert.ToString(dr["ItemWareHouse"])
                    });
            }

            return DNList;
        }

        //-----------------------------------------
        // VIEW  (JO_DeliveryNote_View_SP : Table0 head, Table1 items, Table2 address)
        //-----------------------------------------
        public List<JO_DeliveryNoteCreate_DTO> DeliveryNoteViewList(DataSet DS)
        {
            List<JO_DeliveryNoteCreate_DTO> DNList = new List<JO_DeliveryNoteCreate_DTO>();

            if (DS != null && DS.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow dr in DS.Tables[0].Rows)
                {
                    JO_DeliveryNoteCreate_DTO dto = new JO_DeliveryNoteCreate_DTO();

                    // HEADER
                    dto.Header = new JO_DeliveryNoteHeader_DTO
                    {
                        JODNH_Number = Convert.ToInt64(dr["JODNH_Number"]),
                        JODNH_DN_No = Convert.ToString(dr["JODNH_DN_No"]),
                        JODNH_DN_Date = Convert.ToDateTime(dr["JODNH_DN_Date"]),
                        JODNH_MS_Number = Convert.ToInt64(dr["JODNH_MS_Number"]),
                        JODNH_JW_Vendor_Number = Convert.ToInt64(dr["JODNH_JW_Vendor_Number"]),
                        JODNH_Currency_Number = Convert.ToInt64(dr["JODNH_Currency_Number"]),
                        JODNH_WH_Number = Convert.ToInt64(dr["JODNH_WH_Number"]),
                        JODNH_IsFreightApplicable = Convert.ToString(dr["JODNH_IsFreightApplicable"]),
                        JODNH_PaymentTerms = Convert.ToString(dr["JODNH_PaymentTerms"]),
                        JODNH_DeliveryTerms = Convert.ToString(dr["JODNH_DeliveryTerms"]),
                        JODNH_DeliveryMode = Convert.ToString(dr["JODNH_DeliveryMode"]),
                        JODNH_DespatchDocumentNo = Convert.ToString(dr["JODNH_DespatchDocumentNo"]),
                        JODNH_DespatchedThrough = Convert.ToString(dr["JODNH_DespatchedThrough"]),
                        JODNH_Remarks = Convert.ToString(dr["JODNH_Remarks"]),
                        JODNH_Warehouse = Convert.ToString(dr["JODNH_Warehouse"]),
                        JODNH_VendorName = Convert.ToString(dr["JODNH_VendorName"]),
                        JODNH_CurrencyCode = Convert.ToString(dr["JODNH_CurrencyCode"]),
                        JODNH_Segregation = Convert.ToString(dr["JODNH_Segregation"])
                    };

                    // ITEM LIST
                    dto.Items = new List<JO_DeliveryNoteItem_DTO>();

                    foreach (DataRow item in DS.Tables[1].Rows)
                    {
                        dto.Items.Add(
                            new JO_DeliveryNoteItem_DTO
                            {
                                JODNI_Number = Convert.ToInt64(item["JODNI_Number"]),
                                JODNI_JODNH_Number = Convert.ToInt64(item["JODNI_JODNH_Number"]),
                                JODNI_JPRS_Number = Convert.ToInt64(item["JODNI_JPRS_Number"]),
                                JODNI_Item_Number = Convert.ToInt64(item["JODNI_Item_Number"]),
                                JODNI_WH_Number = Convert.ToInt64(item["JODNI_WH_Number"]),
                                JODNI_UoM_Number = Convert.ToInt64(item["JODNI_UoM_Number"]),
                                JODNI_Qty = Convert.ToDouble(item["JODNI_Qty"]),
                                JODNI_Qty_Kgs = item["JODNI_Qty_Kgs"] == DBNull.Value ? 0 : Convert.ToDouble(item["JODNI_Qty_Kgs"]),
                                JODNI_UnitPrice = Convert.ToDouble(item["JODNI_UnitPrice"]),
                                JODNI_Amount = Convert.ToDouble(item["JODNI_Amount"]),
                                JODNI_IsFreightApplicable = Convert.ToString(item["JODNI_IsFreightApplicable"]),
                                JODNI_FromWH_Number = item["JODNI_FromWH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(item["JODNI_FromWH_Number"]),
                                JODNI_ToWH_Number = item["JODNI_ToWH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(item["JODNI_ToWH_Number"]),
                                JODNI_JOFRT_SVOH_Number = item["JODNI_JOFRT_SVOH_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(item["JODNI_JOFRT_SVOH_Number"]),
                                JODNI_JOFRT_SVOI_Number = item["JODNI_JOFRT_SVOI_Number"] == DBNull.Value ? (long?)null : Convert.ToInt64(item["JODNI_JOFRT_SVOI_Number"]),
                                JODNI_ProcessName = Convert.ToString(item["JODNI_ProcessName"]),
                                JODNI_ItemName = Convert.ToString(item["JODNI_ItemName"]),
                                JODNI_ItemDescription = Convert.ToString(item["JODNI_ItemDescription"]),
                                JODNI_OuterDia = Convert.ToString(item["JODNI_OuterDia"]),
                                JODNI_Thickness = Convert.ToString(item["JODNI_Thickness"]),
                                JODNI_Length = Convert.ToString(item["JODNI_Length"]),
                                JODNI_Width = Convert.ToString(item["JODNI_Width"]),
                                JODNI_MaterialGrade = Convert.ToString(item["JODNI_MaterialGrade"]),
                                JODNI_UOM = Convert.ToString(item["JODNI_UOM"]),
                                JODNI_Warehouse = Convert.ToString(item["JODNI_Warehouse"])
                            });
                    }

                    // ADDRESS LIST
                    dto.Addresses = new List<JO_DeliveryNoteAddress_DTO>();

                    foreach (DataRow add in DS.Tables[2].Rows)
                    {
                        dto.Addresses.Add(
                            new JO_DeliveryNoteAddress_DTO
                            {
                                JODNA_Number = Convert.ToInt64(add["JODNA_Number"]),
                                JODNA_JODNH_Number = Convert.ToInt64(add["JODNA_JODNH_Number"]),
                                JODNA_ADTP_Number = Convert.ToInt64(add["JODNA_ADTP_Number"]),
                                JODNA_Address_ID = Convert.ToString(add["JODNA_Address_ID"]),
                                JODNA_Address = Convert.ToString(add["JODNA_Address"]),
                                JODNA_City = Convert.ToString(add["JODNA_City"]),
                                JODNA_State = Convert.ToString(add["JODNA_State"]),
                                JODNA_Country = Convert.ToString(add["JODNA_Country"]),
                                JODNA_PIN = Convert.ToString(add["JODNA_PIN"]),
                                JODNA_GSTIN = Convert.ToString(add["JODNA_GSTIN"])
                            });
                    }

                    DNList.Add(dto);
                }
            }

            return DNList;
        }

        //-----------------------------------------
        // DETAILED
        //-----------------------------------------
        public List<JO_DeliveryNoteDetailed_DTO> DNDetailedList(DataTable Dt)
        {
            List<JO_DeliveryNoteDetailed_DTO> DNList = new List<JO_DeliveryNoteDetailed_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                DNList.Add(
                    new JO_DeliveryNoteDetailed_DTO
                    {
                        JODNH_Number =
                            dr["JODNH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JODNH_Number"]),

                        JODNH_DN_No =
                            dr["JODNH_DN_No"] == DBNull.Value ? "" : Convert.ToString(dr["JODNH_DN_No"]),

                        JODNH_DN_Date =
                            dr["JODNH_DN_Date"] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(dr["JODNH_DN_Date"]),

                        JODNH_JW_Vendor_Number =
                            dr["JODNH_JW_Vendor_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JODNH_JW_Vendor_Number"]),

                        JWV_JVG_Number =
                            dr["JWV_JVG_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JWV_JVG_Number"]),

                        JVG_JW_VendorGroup =
                            dr["JVG_JW_VendorGroup"] == DBNull.Value ? "" : Convert.ToString(dr["JVG_JW_VendorGroup"]),

                        JVC_JW_VendorCategory =
                            dr["JVC_JW_VendorCategory"] == DBNull.Value ? "" : Convert.ToString(dr["JVC_JW_VendorCategory"]),

                        JWV_JW_VendorName =
                            dr["JWV_JW_VendorName"] == DBNull.Value ? "" : Convert.ToString(dr["JWV_JW_VendorName"]),

                        CurrencyCode =
                            dr["CurrencyCode"] == DBNull.Value ? "" : Convert.ToString(dr["CurrencyCode"]),

                        WarehouseCode =
                            dr["WarehouseCode"] == DBNull.Value ? "" : Convert.ToString(dr["WarehouseCode"]),

                        JODNH_MS_Number =
                            dr["JODNH_MS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JODNH_MS_Number"]),

                        VendorWareHouse =
                            dr["VendorWareHouse"] == DBNull.Value ? "" : Convert.ToString(dr["VendorWareHouse"]),

                        ItemWareHouse =
                            dr["ItemWareHouse"] == DBNull.Value ? "" : Convert.ToString(dr["ItemWareHouse"]),

                        Segregation =
                            dr["Segregation"] == DBNull.Value ? "" : Convert.ToString(dr["Segregation"]),

                        JODNI_JPRS_Number =
                            dr["JODNI_JPRS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JODNI_JPRS_Number"]),

                        JODNI_Item_Number =
                            dr["JODNI_Item_Number"] == DBNull.Value ? 0 : Convert.ToInt64(dr["JODNI_Item_Number"]),

                        Process =
                            dr["Process"] == DBNull.Value ? "" : Convert.ToString(dr["Process"]),

                        ItemGroup =
                            dr["ItemGroup"] == DBNull.Value ? "" : Convert.ToString(dr["ItemGroup"]),

                        ItemCode =
                            dr["ItemCode"] == DBNull.Value ? "" : Convert.ToString(dr["ItemCode"]),

                        ItemDescription =
                            dr["ItemDescription"] == DBNull.Value ? "" : Convert.ToString(dr["ItemDescription"]),

                        OuterDia =
                            dr["OuterDia"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["OuterDia"]),

                        Thickness =
                            dr["Thickness"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["Thickness"]),

                        ItemLength =
                            dr["ItemLength"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["ItemLength"]),

                        ITM_Width =
                            dr["ITM_Width"] == DBNull.Value ? (decimal?)null : Convert.ToDecimal(dr["ITM_Width"]),

                        MaterialGrade =
                            dr["MaterialGrade"] == DBNull.Value ? "" : Convert.ToString(dr["MaterialGrade"]),

                        Warehouse =
                            dr["Warehouse"] == DBNull.Value ? "" : Convert.ToString(dr["Warehouse"]),

                        UOM =
                            dr["UOM"] == DBNull.Value ? "" : Convert.ToString(dr["UOM"]),

                        JODNI_Qty =
                            dr["JODNI_Qty"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["JODNI_Qty"]),

                        JODNI_Qty_Kgs =
                            dr["JODNI_Qty_Kgs"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["JODNI_Qty_Kgs"]),

                        JODNI_UnitPrice =
                            dr["JODNI_UnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["JODNI_UnitPrice"]),

                        JODNI_Amount =
                            dr["JODNI_Amount"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["JODNI_Amount"]),

                        JODNI_IsFreightApplicable =
                            dr["JODNI_IsFreightApplicable"] == DBNull.Value ? "" : Convert.ToString(dr["JODNI_IsFreightApplicable"])
                    });
            }

            return DNList;
        }
    }
}