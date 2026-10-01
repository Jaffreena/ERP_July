using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class JW_VendorGroup_DL
    {
        // List (SP Id 2, Table 0)  -> Under = parent name / "Primary"
        public List<JW_VendorGroup_DTO> JW_VendorGroupList(DataTable Dt)
        {
            List<JW_VendorGroup_DTO> JVG_List = new List<JW_VendorGroup_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JVG_List.Add(
                    new JW_VendorGroup_DTO
                    {
                        JVG_Number = Convert.ToInt64(dr["JVG_Number"]),
                        JVG_JW_VendorGroup = Convert.ToString(dr["JVG_JW_VendorGroup"]),
                        JVG_Description = Convert.ToString(dr["JVG_Description"]),
                        JVG_Under_JVG_Number = Convert.ToString(dr["JVG_Under_JVG_Number"])
                    });
            }

            return JVG_List;
        }

        // Edit (SP Id 4)  -> Under = parent Number (as string, 0 = Primary)
        public List<JW_VendorGroup_DTO> JW_VendorGroupEdit(DataTable Dt)
        {
            List<JW_VendorGroup_DTO> JVG_List = new List<JW_VendorGroup_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JVG_List.Add(
                    new JW_VendorGroup_DTO
                    {
                        JVG_Number = Convert.ToInt64(dr["JVG_Number"]),
                        JVG_JW_VendorGroup = Convert.ToString(dr["JVG_JW_VendorGroup"]),
                        JVG_Description = Convert.ToString(dr["JVG_Description"]),
                        JVG_Under_JVG_Number = Convert.ToString(dr["JVG_Under_JVG_Number"])
                    });
            }

            return JVG_List;
        }
    }
}
