import React from "react";
import $ from "jquery";
import "datatables.net-dt/css/jquery.dataTables.css";
$.DataTable = require("datatables.net");
import { glossaryData } from './GlossaryData'

export default class DataTable extends React.Component {
  componentDidMount() {
    if (!$.fn.DataTable.isDataTable("#myTable")) {
        $(document).ready(function () {
          setTimeout(function () {
            $("#table").DataTable({
              pagingType: "full_numbers",
              pageLength: 20,
              processing: true,
              dom: "Bfrtip",
              select: {
                style: "single",
              },
  
              buttons: [
                {
                  extend: "pageLength",
                  className: "btn btn-secondary bg-secondary",
                },
                {
                  extend: "copy",
                  className: "btn btn-secondary bg-secondary",
                },
                {
                  extend: "csv",
                  className: "btn btn-secondary bg-secondary",
                },
                {
                  extend: "print",
                  customize: function (win) {
                    $(win.document.body).css("font-size", "10pt");
                    $(win.document.body)
                      .find("table")
                      .addClass("compact")
                      .css("font-size", "inherit");
                  },
                  className: "btn btn-secondary bg-secondary",
                },
              ],
  
              fnRowCallback: function (
                nRow,
                aData,
                iDisplayIndex,
                iDisplayIndexFull
              ) {
                var index = iDisplayIndexFull + 1;
                $("td:first", nRow).html(index);
                return nRow;
              },
  
              lengthMenu: [
                [10, 20, 30, 50, -1],
                [10, 20, 30, 50, "All"],
              ],
              columnDefs: [
                {
                  targets: 0,
                  render: function (data, type, row, meta) {
                    return type === "export" ? meta.row + 1 : data;
                  },
                },
              ],
            });
          }, 1000);
        });
      }  
  }

  showTable = () => {
    try {
        return glossaryData.map((item, index) => {
            return (
                <tr>
                <td className="text-xs font-weight-bold">{index}</td>
                <td className="text-xs font-weight-bold">{item[0]}</td>
                <td className="text-xs font-weight-bold">{item[1]}</td>
                <td className="text-xs font-weight-bold"><a href={item[2]}>Link</a></td>
                </tr>
                );
        });
        } catch (e) {
        alert(e.message);
        }
    };

  render() {
    return(
        <table id="table" className="table align-items-center justify-content-center mb-0">
            <thead>
                <tr>
                <th className="text-uppercase text-secondary text-sm font-weight-bolder opacity-7 ps-2">Index</th>
                <th className="text-uppercase text-secondary text-sm font-weight-bolder opacity-7 ps-2">Term</th>
                <th className="text-uppercase text-secondary text-sm font-weight-bolder opacity-7 ps-2">Description</th>
                <th className="text-uppercase text-secondary text-sm font-weight-bolder opacity-7 ps-2">Links</th>
                </tr>
            </thead>

            <tbody>
                    {this.showTable()}
            </tbody>
        </table>
    );
    }
}
