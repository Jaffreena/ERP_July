using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;

namespace ERP_DL
{
    public class JO_ReceiptNote_DL
    {
        // Summary list (DN: DNSummaryList)
        public List<JO_ReceiptNoteSummary_DTO> RNSummaryList(DataTable Dt)
        {
            return MapList<JO_ReceiptNoteSummary_DTO>(Dt);
        }

        // Detailed list (DN: DNDetailedList)
        public List<JO_ReceiptNoteDetailed_DTO> RNDetailedList(DataTable Dt)
        {
            return MapList<JO_ReceiptNoteDetailed_DTO>(Dt);
        }

        // View / Edit (DN: DeliveryNoteViewList)
        // DS.Tables[0] = Header, [1] = Items, [2] = Batches
        public List<JO_ReceiptNoteCreate_DTO> ReceiptNoteViewList(DataSet DS)
        {
            List<JO_ReceiptNoteCreate_DTO> RNList = new List<JO_ReceiptNoteCreate_DTO>();

            if (DS != null && DS.Tables.Count > 0 && DS.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow dr in DS.Tables[0].Rows)
                {
                    JO_ReceiptNoteCreate_DTO dto = new JO_ReceiptNoteCreate_DTO();

                    dto.Header = MapRow<JO_ReceiptNoteHeader_DTO>(dr);

                    dto.Items = DS.Tables.Count > 1
                        ? MapList<JO_ReceiptNoteItem_DTO>(DS.Tables[1])
                        : new List<JO_ReceiptNoteItem_DTO>();

                    dto.receiptNoteBatches = DS.Tables.Count > 2
                        ? MapList<JO_ReceiptNoteBatch_DTO>(DS.Tables[2])
                        : new List<JO_ReceiptNoteBatch_DTO>();

                    RNList.Add(dto);
                }
            }
            return RNList;
        }

        // ---------- helpers : column name == property name ----------
        private List<T> MapList<T>(DataTable Dt) where T : new()
        {
            List<T> list = new List<T>();
            if (Dt == null) return list;
            foreach (DataRow dr in Dt.Rows)
                list.Add(MapRow<T>(dr));
            return list;
        }

        private T MapRow<T>(DataRow dr) where T : new()
        {
            T obj = new T();
            PropertyInfo[] props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (DataColumn col in dr.Table.Columns)
            {
                PropertyInfo p = props.FirstOrDefault(x => x.CanWrite &&
                    string.Equals(x.Name, col.ColumnName, StringComparison.OrdinalIgnoreCase));
                if (p == null) continue;

                object val = dr[col];
                Type t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;

                if (val == DBNull.Value)
                {
                    if (t == typeof(string)) p.SetValue(obj, "");
                    else if (t.IsValueType && Nullable.GetUnderlyingType(p.PropertyType) == null)
                        p.SetValue(obj, Activator.CreateInstance(t));
                    continue;
                }

                try
                {
                    if (t == typeof(bool))
                    {
                        string s = Convert.ToString(val);
                        p.SetValue(obj, s == "1" || s.Equals("true", StringComparison.OrdinalIgnoreCase));
                    }
                    else
                        p.SetValue(obj, Convert.ChangeType(val, t));
                }
                catch { /* skip bad type */ }
            }
            return obj;
        }
    }
}