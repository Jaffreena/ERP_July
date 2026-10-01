using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class JW_VendorCategory_DL
    {
        // List (SP Id 2, Table 0)  -> Under = parent name / "Primary"
        public List<JW_VendorCategory_DTO> JW_VendorCategoryList(DataTable Dt)
        {
            List<JW_VendorCategory_DTO> JVC_List = new List<JW_VendorCategory_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JVC_List.Add(
                    new JW_VendorCategory_DTO
                    {
                        JVC_Number = Convert.ToInt64(dr["JVC_Number"]),
                        JVC_JW_VendorCategory = Convert.ToString(dr["JVC_JW_VendorCategory"]),
                        JVC_Description = Convert.ToString(dr["JVC_Description"]),
                        JVC_Under_JVC_Number = Convert.ToString(dr["JVC_Under_JVC_Number"])
                    });
            }

            return JVC_List;
        }

        // Edit (SP Id 4)  -> Under = parent Number (as string, 0 = Primary)
        public List<JW_VendorCategory_DTO> JW_VendorCategoryEdit(DataTable Dt)
        {
            List<JW_VendorCategory_DTO> JVC_List = new List<JW_VendorCategory_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JVC_List.Add(
                    new JW_VendorCategory_DTO
                    {
                        JVC_Number = Convert.ToInt64(dr["JVC_Number"]),
                        JVC_JW_VendorCategory = Convert.ToString(dr["JVC_JW_VendorCategory"]),
                        JVC_Description = Convert.ToString(dr["JVC_Description"]),
                        JVC_Under_JVC_Number = Convert.ToString(dr["JVC_Under_JVC_Number"])
                    });
            }

            return JVC_List;
        }
    }
}
